import { Router, Request, Response } from 'express';
import AnnouncementBar from '../models/AnnouncementBar';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/announcement-bar/public — public
router.get('/public', async (_req: Request, res: Response): Promise<void> => {
  try {
    let bar = await AnnouncementBar.findOne();
    if (!bar) {
      bar = await AnnouncementBar.create({ announcements: [] });
    }
    res.json({ announcementBar: bar });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving announcement bar' });
  }
});

// GET /api/announcement-bar — admin/staff
router.get('/', protect, staffOrAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    let bar = await AnnouncementBar.findOne();
    if (!bar) {
      bar = await AnnouncementBar.create({ announcements: [] });
    }
    res.json({ announcementBar: bar });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving announcement bar' });
  }
});

// PUT /api/announcement-bar — admin/staff
router.put(
  '/',
  protect,
  staffOrAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      let bar = await AnnouncementBar.findOne();
      
      const updateData = { ...req.body };
      
      if (!bar) {
        bar = await AnnouncementBar.create(updateData);
      } else {
        bar.set(updateData);
        await bar.save();
      }

      res.json({ message: 'Announcement bar updated successfully', announcementBar: bar });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error updating announcement bar' });
    }
  }
);

export default router;