import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import ShowcaseBuild from '../models/ShowcaseBuild';
import Partner from '../models/Partner';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';
import PCPart from '../models/PCPart';

const router = Router();

// GET /api/showcases/:creatorCode — public, list all active showcases for a creator
router.get('/:creatorCode', async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorCode = req.params.creatorCode.toLowerCase();
    const showcases = await ShowcaseBuild.find({ creatorCode, isActive: true })
      .populate('parts.part')
      .populate('partner', 'name logo website description twitter twitch youtube instagram tiktok')
      .sort({ createdAt: -1 });

    let partner = null;
    if (showcases.length > 0 && showcases[0].partner) {
      partner = showcases[0].partner;
    } else {
      // Try to find partner anyway in case they have no builds
      partner = await Partner.findOne({ creatorCode: new RegExp('^' + creatorCode + '$', 'i') }).select('-password');
    }

    res.json({ showcases, partner });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/showcases/admin/all — admin list
router.get('/admin/all', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const showcases = await ShowcaseBuild.find().sort({ createdAt: -1 });
    res.json({ showcases });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/showcases/admin/:id — admin details
router.get('/admin/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const showcase = await ShowcaseBuild.findById(req.params.id).populate('parts.part');
    if (!showcase) {
      res.status(404).json({ message: 'Showcase not found' });
      return;
    }
    res.json({ showcase });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/showcases — admin create
router.post(
  '/',
  protect,
  staffOrAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('creatorName').notEmpty().withMessage('Creator name is required'),
    body('creatorCode').notEmpty().withMessage('Creator code is required'),
    body('parts').isArray().withMessage('Parts array is required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { name, creatorName, creatorCode, partner, description, images, parts, laborFee, isActive } = req.body;
      
      // Calculate totals
      let subtotal = 0;
      for (const p of parts) {
        if (p.part) {
          const partDoc = await PCPart.findById(p.part);
          if (partDoc) {
            subtotal += (partDoc.price * (p.quantity || 1));
          }
        }
      }
      
      const total = subtotal + (laborFee || 99.99);

      const showcase = await ShowcaseBuild.create({
        name,
        creatorName,
        creatorCode: creatorCode.toLowerCase(),
        partner: partner || undefined,
        description,
        images: images || [],
        parts,
        subtotal,
        laborFee: laborFee || 99.99,
        total,
        isActive: isActive !== undefined ? isActive : true,
      });

      res.status(201).json({ showcase });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Server error' });
    }
  }
);

// PUT /api/showcases/:id — admin update
router.put('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const showcase = await ShowcaseBuild.findById(req.params.id);
    if (!showcase) {
      res.status(404).json({ message: 'Showcase not found' });
      return;
    }

    const { name, creatorName, creatorCode, partner, description, images, parts, laborFee, isActive } = req.body;
    
    // Recalculate totals if parts or laborFee changed
    let subtotal = showcase.subtotal;
    if (parts) {
      subtotal = 0;
      for (const p of parts) {
        if (p.part) {
          const partDoc = await PCPart.findById(p.part);
          if (partDoc) {
            subtotal += (partDoc.price * (p.quantity || 1));
          }
        }
      }
    }

    const updatedLaborFee = laborFee !== undefined ? laborFee : showcase.laborFee;
    const total = subtotal + updatedLaborFee;

    showcase.name = name || showcase.name;
    showcase.creatorName = creatorName || showcase.creatorName;
    if (creatorCode) showcase.creatorCode = creatorCode.toLowerCase();
    showcase.partner = partner !== undefined ? partner : showcase.partner;
    showcase.description = description !== undefined ? description : showcase.description;
    showcase.images = images !== undefined ? images : showcase.images;
    if (parts) showcase.parts = parts;
    showcase.subtotal = subtotal;
    showcase.laborFee = updatedLaborFee;
    showcase.total = total;
    showcase.isActive = isActive !== undefined ? isActive : showcase.isActive;

    await showcase.save();
    
    res.json({ showcase });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// DELETE /api/showcases/:id — admin delete
router.delete('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const showcase = await ShowcaseBuild.findByIdAndDelete(req.params.id);
    if (!showcase) {
      res.status(404).json({ message: 'Showcase not found' });
      return;
    }
    res.json({ message: 'Showcase deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
