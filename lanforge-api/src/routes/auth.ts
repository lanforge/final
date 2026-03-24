import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';
import { sendPasswordReset } from '../services/emailService';

const router = Router();

const generateToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });

// POST /api/auth/login — admin & staff only
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.comparePassword(password))) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({ message: 'Account is disabled' });
        return;
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(String(user._id));
      res.json({ token, user });
    } catch (error) {
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// GET /api/auth/me
router.get('/me', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [body('email').isEmail()],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        // Don't reveal if email exists
        res.json({ message: 'If that email exists, a reset link has been sent' });
        return;
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      try {
        await sendPasswordReset(user.name, user.email, resetToken);
      } catch (e) {
        console.error('Password reset email failed:', e);
      }

      res.json({ message: 'If that email exists, a reset link has been sent' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;