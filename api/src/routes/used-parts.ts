import { Router, Request, Response } from 'express';
import UsedPart, { UsedPartType } from '../models/UsedPart';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const VALID_TYPES: UsedPartType[] = [
  'cpu', 'gpu', 'ram', 'storage', 'case', 'psu', 'cpu-cooler', 'motherboard', 'fan', 'other',
];

// GET /api/used-parts — public, filterable by type, brand, search
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;
    const skip = (page - 1) * limit;

    const type = req.query.type as UsedPartType;
    const brand = req.query.brand as string;
    const search = req.query.search as string;
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const filter: any = {};
    if (type && VALID_TYPES.includes(type)) filter.type = type;
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.price = {};
      if (!isNaN(minPrice)) filter.price.$gte = minPrice;
      if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }
    if (search) {
      const searchTerms = search.trim().split(/\s+/);
      filter.$and = searchTerms.map(term => ({
        $or: [
          { brand: { $regex: term, $options: 'i' } },
          { partModel: { $regex: term, $options: 'i' } },
        ]
      }));
    }

    const sortObj: any = {};
    sortObj[sortBy] = order;

    const [parts, total] = await Promise.all([
      UsedPart.find(filter)
        .populate('tradeIn', 'tradeCode customerName')
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      UsedPart.countDocuments(filter),
    ]);

    res.json({ parts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/used-parts/types — public: list of available types with counts
router.get('/types', async (_req: Request, res: Response): Promise<void> => {
  try {
    const counts = await UsedPart.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ types: counts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/used-parts/:id — public: single part
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const part = await UsedPart.findById(req.params.id)
      .populate('tradeIn', 'tradeCode customerName scannerReport.summary');

    if (!part) {
      res.status(404).json({ message: 'Used part not found' });
      return;
    }

    const related = await UsedPart.find({
      type: part.type,
      _id: { $ne: part._id },
    }).limit(6);

    res.json({ part, related });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET /api/used-parts/admin/all — admin/staff: full list
router.get('/admin/all', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;
    const search = req.query.search as string;

    const filter: any = {};
    if (type) filter.type = type.toLowerCase() as UsedPartType;
    if (search) {
      const searchTerms = search.trim().split(/\s+/);
      filter.$and = searchTerms.map(term => ({
        $or: [
          { brand: { $regex: term, $options: 'i' } },
          { partModel: { $regex: term, $options: 'i' } },
        ]
      }));
    }

    const [parts, total] = await Promise.all([
      UsedPart.find(filter)
        .populate('tradeIn', 'tradeCode customerName')
        .sort({ type: 1, brand: 1, partModel: 1 })
        .skip(skip)
        .limit(limit),
      UsedPart.countDocuments(filter),
    ]);

    res.json({ parts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/used-parts — admin/staff: create a used part
router.post('/', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const part = await UsedPart.create(req.body);
    res.status(201).json({ part });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/used-parts/:id — admin/staff: update
router.put('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const part = await UsedPart.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!part) {
      res.status(404).json({ message: 'Used part not found' });
      return;
    }
    res.json({ part });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/used-parts/:id — admin/staff: delete
router.delete('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const part = await UsedPart.findByIdAndDelete(req.params.id);
    if (!part) {
      res.status(404).json({ message: 'Used part not found' });
      return;
    }
    res.json({ message: 'Used part deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;