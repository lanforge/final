import { Router, Request, Response } from 'express';
import Cart from '../models/Cart';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/carts/:sessionId — public fetch cart
router.get('/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    let cart = await Cart.findOne({ sessionId: req.params.sessionId, status: 'active' })
      .populate('items.product', 'name price images slug stock reserved')
      .populate('items.pcPart', 'name brand price images slug stock reserved type')
      .populate('items.accessory', 'name brand price images slug stock reserved type')
      .populate({
        path: 'items.customBuild',
        populate: { path: 'parts.part', select: 'name price images' }
      });

    if (!cart) {
      cart = await Cart.create({ sessionId: req.params.sessionId, items: [] });
    }

    res.json({ cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/carts/:sessionId — public update cart (sync full cart state)
router.put('/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, customerId, discountCode, creatorCode, clearDiscount } = req.body;
    
    // Auto-update expiry (rolling 30 days on interaction)
    const expiresAt = new Date(+new Date() + 30 * 24 * 60 * 60 * 1000);

    const update: any = { items, expiresAt };
    if (customerId) update.customer = customerId;
    if (discountCode !== undefined) update.discountCode = discountCode;
    if (creatorCode !== undefined) update.creatorCode = creatorCode;
    if (clearDiscount || (items && items.length === 0)) {
      update.customDiscountAmount = 0;
    }

    const cart = await Cart.findOneAndUpdate(
      { sessionId: req.params.sessionId, status: 'active' },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate('items.product', 'name price images slug stock reserved')
      .populate('items.pcPart', 'name brand price images slug stock reserved type')
      .populate('items.accessory', 'name brand price images slug stock reserved type')
      .populate({
        path: 'items.customBuild',
        populate: { path: 'parts.part', select: 'name price images' }
      });

    res.json({ cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET /api/carts/admin/all — admin/staff see active/abandoned carts
router.get('/admin/all', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const status = req.query.status as string; // 'active', 'abandoned', 'converted'
    const filter: any = {};
    if (status && status !== 'all') filter.status = status;

    const [carts, total] = await Promise.all([
      Cart.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customer', 'firstName lastName email')
        .populate('items.product', 'name price')
        .populate('items.customBuild', 'name total'),
      Cart.countDocuments(filter),
    ]);

    res.json({ carts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/carts/admin/:id — admin dynamically adjust a cart
router.put('/admin/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, discountCode, creatorCode, status, customDiscountAmount } = req.body;
    
    const update: any = {};
    if (items) update.items = items;
    if (discountCode !== undefined) update.discountCode = discountCode;
    if (creatorCode !== undefined) update.creatorCode = creatorCode;
    if (status) update.status = status;
    if (customDiscountAmount !== undefined) update.customDiscountAmount = Number(customDiscountAmount);

    const cart = await Cart.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name price');

    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }

    res.json({ cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
