import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import BusinessInfo from '../models/BusinessInfo';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/business/public — public
router.get('/public', async (_req: Request, res: Response): Promise<void> => {
  try {
    let businessInfo = await BusinessInfo.findOne();
    if (!businessInfo) {
      businessInfo = await BusinessInfo.create({});
    }
    res.json({ businessInfo });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving business info' });
  }
});

// GET /api/business — admin/staff
router.get('/', protect, staffOrAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    let businessInfo = await BusinessInfo.findOne();
    if (!businessInfo) {
      businessInfo = await BusinessInfo.create({});
    }
    res.json({ businessInfo });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving business info' });
  }
});

// PUT /api/business — admin/staff
router.put(
  '/',
  protect,
  staffOrAdmin,
  [
    body('storeName').optional().isString(),
    body('email').optional().isEmail(),
    body('phone').optional().isString(),
    body('taxRate').optional().isNumeric(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      let businessInfo = await BusinessInfo.findOne();
      if (!businessInfo) {
        businessInfo = await BusinessInfo.create(req.body);
      } else {
        businessInfo = await BusinessInfo.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
      }
      
      res.json({ message: 'Business info updated successfully', businessInfo });
    } catch (error) {
      res.status(500).json({ message: 'Server error updating business info' });
    }
  }
);

export default router;
