import { Router, Request, Response } from 'express';
import BuildRequest from '../models/BuildRequest';
import { protect, staffOrAdmin } from '../middleware/auth';
import { sendBuildRequestConfirmationEmail, sendBuildRequestDeclinedEmail, sendBuildRequestQuoteEmail } from '../services/emailService';

const router = Router();

// POST /api/build-requests - Create a new build request
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, budget, details, address, usage, preferredBrands, timeline } = req.body;
    
    if (!name || !email || !details) {
      res.status(400).json({ error: 'Name, email, and details are required' });
      return;
    }

    const newRequest = new BuildRequest({ 
      name, email, phone, budget, details, address, usage, preferredBrands, timeline 
    });
    await newRequest.save();

    // Send notification
    try {
      const { sendNotification } = await import('../services/notificationService');
      await sendNotification(`New Build Request from ${name} (${email})\nBudget: ${budget || 'N/A'}\nUsage: ${usage || 'N/A'}\nDetails: ${details}`);
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr);
    }

    // Send confirmation email
    try {
      await sendBuildRequestConfirmationEmail(email, name);
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr);
    }

    res.status(201).json({ message: 'Build request submitted successfully' });
  } catch (error) {
    console.error('Error creating build request:', error);
    res.status(500).json({ error: 'Server error creating build request' });
  }
});

// GET /api/build-requests/:id - Get single build request (admin only)
router.get('/:id', protect, staffOrAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await BuildRequest.findById(req.params.id).populate('quote.parts.partId');
    if (!request) {
      res.status(404).json({ error: 'Build request not found' });
      return;
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching build request:', error);
    res.status(500).json({ error: 'Server error fetching build request' });
  }
});

// GET /api/build-requests - Get all requests (admin only)
router.get('/', protect, staffOrAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await BuildRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching build requests:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/build-requests/:id - Update status (admin only)
router.put('/:id', protect, staffOrAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, rejectionReason } = req.body;
    
    const updateData: any = { status };
    if (status === 'unbuildable' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const request = await BuildRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!request) {
      res.status(404).json({ error: 'Build request not found' });
      return;
    }

    if (status === 'unbuildable' && rejectionReason) {
      try {
        await sendBuildRequestDeclinedEmail(request.email, request.name, rejectionReason);
      } catch (emailErr) {
        console.error('Failed to send decline email:', emailErr);
      }
    }
    
    res.json(request);
  } catch (error) {
    console.error('Error updating build request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/build-requests/:id - Delete a request (admin only)
router.delete('/:id', protect, staffOrAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await BuildRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      res.status(404).json({ error: 'Build request not found' });
      return;
    }
    res.json({ message: 'Build request deleted' });
  } catch (error) {
    console.error('Error deleting build request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/build-requests/:id/quote - Save and email quote (admin only)
router.post('/:id/quote', protect, staffOrAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { parts, laborCost, shipping, totalPrice } = req.body;
    
    if (!parts || !shipping || totalPrice === undefined) {
      res.status(400).json({ error: 'Parts, shipping, and totalPrice are required' });
      return;
    }

    const request = await BuildRequest.findById(req.params.id);
    if (!request) {
      res.status(404).json({ error: 'Build request not found' });
      return;
    }

    request.quote = {
      parts,
      laborCost,
      shipping,
      totalPrice,
      sentAt: new Date()
    };
    
    // Update status to 'reviewed' when quote is sent
    if (request.status === 'pending') {
      request.status = 'reviewed';
    }

    await request.save();

    // Send email using emailService
    try {
      await sendBuildRequestQuoteEmail(request.email, request.name, request.quote);
    } catch (emailErr) {
      console.error('Failed to send quote email:', emailErr);
      // We don't return error here because the quote was saved successfully
    }

    res.json({ message: 'Quote saved and sent successfully', request });
  } catch (error) {
    console.error('Error saving build request quote:', error);
    res.status(500).json({ error: 'Server error saving build request quote' });
  }
});

export default router;
