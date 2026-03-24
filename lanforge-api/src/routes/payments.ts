import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import { createPaymentIntent, confirmPaymentIntent, constructWebhookEvent } from '../services/stripeService';
import { createPayPalOrder, capturePayPalOrder } from '../services/paypalService';
import { authorizeAffirmCharge, captureAffirmCharge } from '../services/affirmService';
import { sendOrderConfirmation } from '../services/emailService';

const router = Router();

// POST /api/payments/stripe/create-checkout-intent
router.post('/stripe/create-checkout-intent', async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    const intent = await createPaymentIntent(Math.max(1, amount), 'usd', {});
    res.json({ clientSecret: intent.client_secret });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/stripe/create-intent
router.post('/stripe/create-intent', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const intent = await createPaymentIntent(order.total, 'usd', {
      orderId: String(order._id),
      orderNumber: order.orderNumber,
    });

    res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/stripe/confirm
router.post('/stripe/confirm', async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentIntentId, orderId } = req.body;
    const intent = await confirmPaymentIntent(paymentIntentId);

    if (intent.status === 'succeeded') {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: 'paid', paymentId: paymentIntentId, status: 'order-confirmed' },
        { new: true }
      );

      if (order) {
        // Send confirmation email
        try {
          const emailData = {
            orderNumber: order.orderNumber,
            customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
            email: order.shippingAddress.email,
            items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
            subtotal: order.subtotal,
            shipping: order.shipping,
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
    } else {
      res.status(400).json({ message: 'Payment not completed', status: intent.status });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

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

// POST /api/payments/paypal/capture
router.post('/paypal/capture', async (req: Request, res: Response): Promise<void> => {
  try {
    const { paypalOrderId, orderId } = req.body;
    const capture = await capturePayPalOrder(paypalOrderId);

    if (capture.status === 'COMPLETED') {
      const captureId = capture.purchase_units[0]?.payments?.captures[0]?.id;
      const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: 'paid', paymentId: captureId, status: 'order-confirmed' },
        { new: true }
      );

      if (order) {
        try {
          const emailData = {
            orderNumber: order.orderNumber,
            customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
            email: order.shippingAddress.email,
            items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
            subtotal: order.subtotal,
            shipping: order.shipping,
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
    } else {
      res.status(400).json({ message: 'PayPal capture failed', status: capture.status });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/webhook/stripe — raw body required
router.post('/webhook/stripe', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  try {
    const event = constructWebhookEvent(req.body as Buffer, sig);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as any;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid',
            paymentId: intent.id,
            status: 'order-confirmed',
          });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as any;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    res.status(400).json({ message: `Webhook error: ${error.message}` });
  }
});

// POST /api/payments/affirm/authorize
router.post('/affirm/authorize', async (req: Request, res: Response): Promise<void> => {
  try {
    const { checkoutToken, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // 1. Authorize the charge
    const charge = await authorizeAffirmCharge(checkoutToken, order.orderNumber);
    
    // 2. Capture the charge (can also be done later when shipping)
    const capture = await captureAffirmCharge(charge.id, order.orderNumber);

    // 3. Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'paid', paymentId: capture.id, status: 'order-confirmed' },
      { new: true }
    );

    if (updatedOrder) {
      try {
        const emailData = {
          orderNumber: updatedOrder.orderNumber,
          customerName: `${updatedOrder.shippingAddress.firstName} ${updatedOrder.shippingAddress.lastName}`,
          email: updatedOrder.shippingAddress.email,
          items: updatedOrder.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          subtotal: updatedOrder.subtotal,
          shipping: updatedOrder.shipping,
          tax: updatedOrder.tax,
          discount: updatedOrder.discount,
          total: updatedOrder.total,
          shippingAddress: updatedOrder.shippingAddress,
        };
        await sendOrderConfirmation(emailData);
      } catch (e) {
        console.error('Order confirmation email failed:', e);
      }
    }

    res.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
