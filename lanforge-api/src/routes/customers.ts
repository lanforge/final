import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Customer from '../models/Customer';
import Order from '../models/Order';
import LoyaltyTransaction from '../models/LoyaltyTransaction';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/customers — admin/staff: paginated customer list
router.get('/', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const tier = req.query.tier as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const filter: any = {};
    if (tier && tier !== 'all') filter.loyaltyTier = tier;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj: any = {};
    sortObj[sortBy] = order;

    const [customers, total] = await Promise.all([
      Customer.find(filter).sort(sortObj).skip(skip).limit(limit),
      Customer.countDocuments(filter),
    ]);

    res.json({ customers, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/customers/:id — admin/staff: single customer with orders
router.get('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const [orders, loyaltyHistory] = await Promise.all([
      Order.find({ customer: customer._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber status paymentStatus total createdAt trackingNumber'),
      LoyaltyTransaction.find({ customer: customer._id }).sort({ createdAt: -1 }).limit(20),
    ]);

    res.json({ customer, orders, loyaltyHistory });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/customers — admin/staff: create customer
router.post(
  '/',
  protect,
  staffOrAdmin,
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const customer = await Customer.create(req.body);
      res.status(201).json({ customer });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ message: 'Email already exists' });
        return;
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/customers/:id — admin/staff
router.put('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    res.json({ customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/customers/:id — admin/staff: soft delete
router.delete('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    res.json({ message: 'Customer deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/customers/:id/loyalty/adjust — admin/staff
router.post('/:id/loyalty/adjust', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { points, reason, type } = req.body;

    if (!['add', 'remove', 'set'].includes(type) || typeof points !== 'number' || points < 0) {
      res.status(400).json({ message: 'Invalid adjustment parameters' });
      return;
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const balanceBefore = customer.loyaltyPoints;
    if (type === 'add') customer.loyaltyPoints += points;
    else if (type === 'remove') customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - points);
    else if (type === 'set') customer.loyaltyPoints = points;

    await customer.save();

    await LoyaltyTransaction.create({
      customer: customer._id,
      points: type === 'remove' ? -points : points,
      type: 'adjust',
      reason,
      balanceBefore,
      balanceAfter: customer.loyaltyPoints,
    });

    res.json({ customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/customers/:id/orders — admin/staff: customer's full order history
router.get('/:id/orders', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ customer: req.params.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ customer: req.params.id }),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/customers/bulk/tag — admin/staff: bulk tagging
router.post('/bulk/tag', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ids, tag } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !tag) {
      res.status(400).json({ message: 'IDs and tag are required' });
      return;
    }

    await Customer.updateMany({ _id: { $in: ids } }, { $addToSet: { tags: tag } });
    res.json({ message: `Tagged ${ids.length} customers with "${tag}"` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;