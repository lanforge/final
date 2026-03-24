import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Partner from '../models/Partner';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/partners — public
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const partners = await Partner.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ partners });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/partners/admin/all — admin/staff list
router.get('/admin/all', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const partners = await Partner.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ partners });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/partners — admin/staff
router.post(
  '/',
  protect,
  staffOrAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('website').isURL().withMessage('Valid website URL is required'),
    body('logo').notEmpty().withMessage('Logo URL is required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const partner = await Partner.create(req.body);
      res.status(201).json({ partner });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/partners/:id — admin/staff
router.put('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!partner) {
      res.status(404).json({ message: 'Partner not found' });
      return;
    }
    res.json({ partner });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/partners/:id — admin/staff
router.delete('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) {
      res.status(404).json({ message: 'Partner not found' });
      return;
    }
    res.json({ message: 'Partner deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/partners/reorder — admin/staff
router.post('/reorder', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { order } = req.body;
    await Promise.all(
      order.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
        Partner.findByIdAndUpdate(id, { sortOrder })
      )
    );
    res.json({ message: 'Partners reordered' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
