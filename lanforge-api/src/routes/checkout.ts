import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/Product';
import PCPart from '../models/PCPart';
import Accessory from '../models/Accessory';
import CustomBuild from '../models/CustomBuild';
import Discount from '../models/Discount';
import Partner from '../models/Partner';
import Customer from '../models/Customer';

const router = Router();

// POST /api/checkout/validate — run right before confirming order logic
router.post(
  '/validate',
  [
    body('items').isArray({ min: 1 }).withMessage('Cart is empty'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { items, discountCode, creatorCode, customerId } = req.body;

      let subtotal = 0;
      const issues: string[] = [];

      for (const item of items) {
        if (item.product) {
          const p = await Product.findById(item.product);
          if (!p || !p.isActive) { issues.push(`Product unavailable: ${p?.name || item.product}`); continue; }
          if (p.stock - p.reserved < item.quantity) issues.push(`Insufficient stock for ${p.name}`);
          subtotal += p.price * item.quantity;
        } else if (item.pcPart) {
          const p = await PCPart.findById(item.pcPart);
          if (!p || !p.isActive) { issues.push(`Part unavailable: ${p?.name || item.pcPart}`); continue; }
          if (p.stock - p.reserved < item.quantity) issues.push(`Insufficient stock for ${p.name}`);
          subtotal += p.price * item.quantity;
        } else if (item.accessory) {
          const a = await Accessory.findById(item.accessory);
          if (!a || !a.isActive) { issues.push(`Accessory unavailable: ${a?.name || item.accessory}`); continue; }
          if (a.stock - a.reserved < item.quantity) issues.push(`Insufficient stock for ${a.name}`);
          subtotal += a.price * item.quantity;
        } else if (item.customBuild) {
          const cb = await CustomBuild.findById(item.customBuild);
          if (!cb) { issues.push(`Custom build not found: ${item.customBuild}`); continue; }
          // Optional: re-verify the internal parts of the custom build here
          subtotal += cb.total * item.quantity;
        }
      }

      if (issues.length > 0) {
        res.status(400).json({ valid: false, issues });
        return;
      }

      let discountAmount = 0;
      let appliedDiscount = null;

      // Validate Discount
      if (discountCode) {
        const dc = await Discount.findOne({
          code: discountCode.toUpperCase(),
          status: 'active',
          expiresAt: { $gte: new Date() },
        });
        if (!dc || subtotal < dc.minOrder) {
          issues.push('Invalid or expired discount code, or minimum order not met');
        } else {
          if (dc.type === 'percentage') discountAmount = subtotal * (dc.value / 100);
          else if (dc.type === 'fixed') discountAmount = Math.min(dc.value, subtotal);
          appliedDiscount = dc;
        }
      }

      // Validate Creator Code
      let appliedCreatorCode = null;
      if (creatorCode) {
        const cc = await Partner.findOne({ creatorCode: creatorCode.toUpperCase(), isActive: true });
        if (!cc) issues.push('Invalid creator code');
        else appliedCreatorCode = cc.creatorCode;
      }
      
      // Validate Customer (if logged in)
      if (customerId) {
        const cust = await Customer.findById(customerId);
        if (!cust || !cust.isActive) issues.push('Customer account not active');
      }

      if (issues.length > 0) {
        res.status(400).json({ valid: false, issues });
        return;
      }

      const FREE_SHIPPING_THRESHOLD = 500;
      const FLAT_RATE = 29.99;
      const shipping = (subtotal - discountAmount >= FREE_SHIPPING_THRESHOLD) ? 0 : FLAT_RATE;
      const tax = (subtotal - discountAmount + shipping) * 0.08;
      const total = subtotal - discountAmount + shipping + tax;

      res.json({
        valid: true,
        summary: {
          subtotal,
          discountAmount,
          shipping,
          tax,
          total,
          appliedDiscount,
          appliedCreatorCode
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error during validation' });
    }
  }
);

export default router;
