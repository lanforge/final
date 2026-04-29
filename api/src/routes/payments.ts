import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import { createPayPalOrder, capturePayPalOrder, refundPayPalCapture } from '../services/paypalService';
import { authorizeAffirmCharge, captureAffirmCharge } from '../services/affirmService';
import { sendOrderConfirmation } from '../services/emailService';
import { protect, staffOrAdmin } from '../middleware/auth';

const router = Router();


// POST /api/payments/paypal/create-order
router.post('/paypal/create-order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const paypalOrder = await createPayPalOrder(
      order.total,
      'USD',
      `LANForge Order #${order.orderNumber}`
    );

    res.json(paypalOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/paypal/capture-order
router.post('/paypal/capture-order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, orderNumber, invoiceId } = req.body;
    const captureData = await capturePayPalOrder(req.body.paypalOrderId);

    if (captureData.status === 'COMPLETED') {
      const capture = captureData.purchase_units[0].payments.captures[0];
      const gatewayTransactionId = capture.id;

      if (orderId) {
        const order = await Order.findByIdAndUpdate(
          orderId,
          { paymentStatus: 'paid', paymentId: gatewayTransactionId, status: 'order-confirmed' },
          { new: true }
        );

        if (order) {
          import('./orders').then(({ notifyOrderUpdated }) => {
            notifyOrderUpdated(order._id.toString());
            notifyOrderUpdated(order.orderNumber);
          });

          await Payment.create({
            amount: parseFloat(capture.amount.value),
            currency: capture.amount.currency_code,
            paymentMethod: 'paypal',
            gatewayTransactionId,
            order: orderId,
            customer: order.customer,
            status: 'completed',
            metadata: { paypalOrderId: req.body.paypalOrderId }
          });

          try {
            const emailData = {
              orderNumber: order.orderNumber,
              customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
              email: order.shippingAddress.email,
              items: order.items.map((i: any) => ({ name: i.name, quantity: i.quantity, price: i.price })),
              subtotal: order.subtotal,
              shipping: order.shipping,
              shippingInsurance: order.shippingInsurance || 0,
              tax: order.tax,
              discount: order.discount,
              total: order.total,
              shippingAddress: order.shippingAddress,
            };
            await sendOrderConfirmation(emailData);
          } catch (e) {
            console.error('Order confirmation email failed:', e);
          }
        }
        res.json({ success: true, order });
      } else if (invoiceId) {
        const invoice = await Invoice.findByIdAndUpdate(invoiceId, {
          status: 'paid',
          paymentId: gatewayTransactionId
        }, { new: true });
        
        if (invoice) {
          await Payment.create({
            amount: parseFloat(capture.amount.value),
            currency: capture.amount.currency_code,
            paymentMethod: 'paypal',
            gatewayTransactionId,
            invoice: invoiceId,
            status: 'completed',
            metadata: { paypalOrderId: req.body.paypalOrderId }
          });

          // Check if the related order needs its payment status updated
          if (invoice.relatedOrderId) {
            const order = await Order.findById(invoice.relatedOrderId);
            if (order) {
              const payments = await Payment.find({ order: order._id, status: 'completed' });
              const totalPaidFromPayments = payments.reduce((sum, p) => sum + p.amount, 0);
              
              const invoices = await Invoice.find({ relatedOrderId: order._id, status: 'paid' });
              const totalPaidFromInvoices = invoices.reduce((sum, inv) => sum + inv.amount, 0);
              
              const totalPaid = totalPaidFromPayments + totalPaidFromInvoices;
              
              if (totalPaid >= order.total && order.paymentStatus !== 'paid') {
                order.paymentStatus = 'paid';
                await order.save();
              }
            }
          }
          res.json({ success: true, invoice });
        } else {
          res.status(404).json({ message: 'Invoice not found' });
        }
      } else {
        res.status(400).json({ message: 'Neither orderId nor invoiceId provided' });
      }
    } else {
      res.status(400).json({ message: 'Payment not completed', status: captureData.status });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/affirm/confirm
router.post('/affirm/confirm', async (req: Request, res: Response): Promise<void> => {
  try {
    const { checkout_token } = req.body;
    
    if (!checkout_token) {
      res.redirect(`${process.env.STORE_URL || 'http://localhost:3000'}/checkout?error=missing_token`);
      return;
    }

    // Capture the Affirm charge
    // We ideally need the orderId here, but Affirm only gives us the checkout_token.
    // In a full implementation, you'd authorize first to get the Affirm order details or pass order ID.
    // For now, we authorize it and see if we can get the order ID from Affirm's payload.
    const authData = await authorizeAffirmCharge(checkout_token, `LANForge_${Date.now()}`);
    
    if (authData && authData.id) {
       // Ideally we would trigger the order processing here or match it to a pending order in DB.
       // The frontend has sent order payload yet or we should have stored a pending order.
       // Because the frontend only created an order on PayPal success, we need to adapt this.
       // However, to keep it simple and functional for now based on the requested redirect:
       
       // Note: we just authorized the charge. We still need the frontend to create the order.
       // Let's redirect to a success page that will handle finalizing the order using a stored cart,
       // or pass the charge ID to the frontend so it can finalize.
       res.redirect(`${process.env.STORE_URL || 'http://localhost:3000'}/checkout?payment_method=affirm&charge_id=${authData.id}`);
    } else {
       res.redirect(`${process.env.STORE_URL || 'http://localhost:3000'}/checkout?error=affirm_authorization_failed`);
    }

  } catch (error: any) {
    console.error('Affirm confirmation error:', error);
    res.redirect(`${process.env.STORE_URL || 'http://localhost:3000'}/checkout?error=affirm_failed`);
  }
});


// POST /api/payments (Manual creation)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency, paymentMethod, gatewayTransactionId, orderId, invoiceId, customerId, status, metadata } = req.body;
    
    // Check if order is already paid to prevent duplicate emails/payments
    if (orderId) {
      const existingOrder = await Order.findById(orderId);
      if (existingOrder && existingOrder.paymentStatus === 'paid') {
        res.status(200).json({ message: 'Order already paid', order: existingOrder });
        return;
      }
    }

    // Capture Affirm charge immediately if this is an Affirm payment
    if (paymentMethod === 'affirm' && gatewayTransactionId) {
      try {
        await captureAffirmCharge(gatewayTransactionId, orderId || `manual_${Date.now()}`);
      } catch (err) {
        console.error('Failed to capture Affirm charge:', err);
        res.status(400).json({ message: 'Failed to capture Affirm payment' });
        return;
      }
    }

    const payment = await Payment.create({
      amount,
      currency: currency || 'usd',
      paymentMethod: paymentMethod || 'manual',
      gatewayTransactionId: gatewayTransactionId || `manual_${Date.now()}`,
      order: orderId,
      invoice: invoiceId,
      customer: customerId,
      status: status || 'completed',
      metadata
    });

    // Optionally update order or invoice status
    if (orderId && status === 'completed') {
      const order = await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', paymentId: payment.gatewayTransactionId, status: 'order-confirmed' }, { new: true });
      if (order) {
        import('./orders').then(({ notifyOrderUpdated }) => {
          notifyOrderUpdated(order._id.toString());
          notifyOrderUpdated(order.orderNumber);
        });
      }
      
      if (order) {
        // Send confirmation email
        try {
          const emailData = {
            orderNumber: order.orderNumber,
            customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
            email: order.shippingAddress.email,
            items: order.items.map((i: any) => ({ name: i.name, quantity: i.quantity, price: i.price })),
            subtotal: order.subtotal,
            shipping: order.shipping,
            shippingInsurance: order.shippingInsurance || 0,
            tax: order.tax,
            discount: order.discount,
            total: order.total,
            shippingAddress: order.shippingAddress,
          };
          await sendOrderConfirmation(emailData);
        } catch (e) {
          console.error('Order confirmation email failed (Manual Creation):', e);
        }
      }
    } else if (invoiceId && status === 'completed') {
      await Invoice.findByIdAndUpdate(invoiceId, { status: 'paid', paymentId: payment.gatewayTransactionId });
    }

    res.status(201).json({ payment });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/payments/:id
router.get('/:id', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order', 'orderNumber status total customer')
      .populate('invoice', 'invoiceNumber status amount')
      .populate('customer', 'firstName lastName email');
    
    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }
    
    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/:id/refund
router.post('/:id/refund', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, reason, forceLocal } = req.body;
    
    const payment = await Payment.findById(id);
    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    if (payment.paymentMethod === 'paypal' || forceLocal) {
      let refundId = `local_refund_${Date.now()}`;
      let refundStatus = 'succeeded';
      let refundedAmount = amount || payment.amount;

      if (payment.paymentMethod === 'paypal' && !forceLocal) {
        const refund = await refundPayPalCapture(payment.gatewayTransactionId, amount);
        refundId = refund.id;
        refundStatus = refund.status === 'COMPLETED' ? 'succeeded' : refund.status;
        refundedAmount = refund.amount ? parseFloat(refund.amount.value) : amount || payment.amount;
      }
      
      const refundMetadata = payment.metadata || {};
      refundMetadata.refunds = refundMetadata.refunds || [];
      refundMetadata.refunds.push({
        id: refundId,
        amount: refundedAmount,
        status: refundStatus,
        reason: reason || 'requested_by_customer',
        createdAt: new Date()
      });

      payment.metadata = refundMetadata;
      
      // Calculate total refunded amount
      const totalRefunded = refundMetadata.refunds.reduce((acc: number, r: any) => acc + (r.amount || 0), 0);
      
      if (totalRefunded >= payment.amount) {
        payment.status = 'refunded';
      }
      
      payment.markModified('metadata');
      await payment.save();

      // Optionally, update order status if fully refunded
      if (payment.status === 'refunded' && payment.order) {
        await Order.findByIdAndUpdate(payment.order, { paymentStatus: 'refunded' });
      }

      res.json({ success: true, payment });
    } else {
      res.status(400).json({ message: `Refunds for ${payment.paymentMethod} are not implemented yet.` });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/payments
router.get('/', protect, async (req: Request, res: Response): Promise<void> => {
  try {
    const { order, invoice, status, paymentMethod } = req.query;
    const query: any = {};
    
    if (order) query.order = order;
    if (invoice) query.invoice = invoice;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const payments = await Payment.find(query)
      .populate('order', 'orderNumber status total')
      .populate('invoice', 'invoiceNumber status amount')
      .sort({ createdAt: -1 });
      
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
