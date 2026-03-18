import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../App.css';

type OrderStatus = 
  | 'Order Confirmed'
  | 'Building'
  | 'Benchmarking'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Returned'
  | 'Cancelled';

const OrderStatusPage: React.FC = () => {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Order Confirmed');
  const [orderId] = useState('LANF-2026-8472');
  const [estimatedDelivery] = useState('March 25, 2026');

  const statusLevels: OrderStatus[] = [
    'Order Confirmed',
    'Building',
    'Benchmarking',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  const specialStatuses: OrderStatus[] = ['Returned', 'Cancelled'];

  const getStatusIndex = (status: OrderStatus): number => {
    return statusLevels.indexOf(status);
  };

  const isSpecialStatus = (status: OrderStatus): boolean => {
    return specialStatuses.includes(status);
  };

  const getProgressPercentage = (): number => {
    if (isSpecialStatus(orderStatus)) {
      return 100;
    }
    const currentIndex = getStatusIndex(orderStatus);
    return ((currentIndex + 1) / statusLevels.length) * 100;
  };

  const getStatusColor = (status: OrderStatus): string => {
    if (status === 'Cancelled') return '#ff4757';
    if (status === 'Returned') return '#ffc107';
    return '#00ff9d';
  };

  const getStatusDescription = (status: OrderStatus): string => {
    const descriptions: Record<OrderStatus, string> = {
      'Order Confirmed': 'Your order has been confirmed and is being prepared for production.',
      'Building': 'Our technicians are assembling your custom gaming PC with premium components.',
      'Benchmarking': 'Your system is undergoing rigorous performance testing and quality assurance.',
      'Shipped': 'Your order has been packaged and shipped with tracking information.',
      'Out for Delivery': 'Your package is on the delivery vehicle and will arrive soon.',
      'Delivered': 'Your order has been successfully delivered to your address.',
      'Returned': 'This order has been returned to our facility.',
      'Cancelled': 'This order has been cancelled.'
    };
    return descriptions[status];
  };

  const getStatusIcon = (status: OrderStatus): string => {
    const icons: Record<OrderStatus, string> = {
      'Order Confirmed': '✅',
      'Building': '🔧',
      'Benchmarking': '📊',
      'Shipped': '🚚',
      'Out for Delivery': '📦',
      'Delivered': '🏠',
      'Returned': '↩️',
      'Cancelled': '❌'
    };
    return icons[status];
  };

  const getEstimatedTime = (status: OrderStatus): string => {
    const times: Record<OrderStatus, string> = {
      'Order Confirmed': '1-2 business days',
      'Building': '3-5 business days',
      'Benchmarking': '1-2 business days',
      'Shipped': '5-7 business days',
      'Out for Delivery': 'Same day',
      'Delivered': 'Completed',
      'Returned': 'Processing',
      'Cancelled': 'Completed'
    };
    return times[status];
  };

  const orderItems = [
    { id: 1, name: 'LANForge Gaming PC Pro', price: 2499.99, quantity: 1 },
    { id: 2, name: 'Custom Water Cooling Kit', price: 399.99, quantity: 1 },
    { id: 3, name: 'Mechanical Gaming Keyboard', price: 129.99, quantity: 2 }
  ];

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0) * 1.08 + 49.99 + 29.99;
  };

  return (
    <div className="order-status-page">
      <div className="container">
        <motion.div 
          className="order-status-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1>Order Status</h1>
          <p className="order-subtitle">Track your order in real-time</p>
          <div className="order-id-display">
            <span className="order-id-label">Order ID:</span>
            <span className="order-id-value">{orderId}</span>
          </div>
        </motion.div>

        <div className="order-status-layout">
          <motion.div 
            className="order-status-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="status-header">
              <h2>Order Progress</h2>
              <div className="status-badge" style={{ backgroundColor: getStatusColor(orderStatus) }}>
                {orderStatus}
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: getStatusColor(orderStatus)
                  }}
                />
              </div>
              
              {!isSpecialStatus(orderStatus) ? (
                <div className="status-levels">
                  {statusLevels.map((level, index) => {
                    const isCompleted = index <= getStatusIndex(orderStatus);
                    const isCurrent = level === orderStatus;
                    
                    return (
                      <div key={level} className="status-level">
                        <div 
                          className={`level-indicator ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                          style={{ 
                            backgroundColor: isCompleted ? getStatusColor(orderStatus) : 'rgba(255, 255, 255, 0.1)',
                            borderColor: isCurrent ? getStatusColor(orderStatus) : 'rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <div className="level-info">
                          <span className="level-title">{level}</span>
                          <span className="level-time">{getEstimatedTime(level)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="special-status">
                  <div className="special-status-icon">{getStatusIcon(orderStatus)}</div>
                  <div className="special-status-info">
                    <h3>{orderStatus}</h3>
                    <p>{getStatusDescription(orderStatus)}</p>
                  </div>
                </div>
              )}

              <div className="current-status-details">
                <div className="status-icon">{getStatusIcon(orderStatus)}</div>
                <div className="status-details">
                  <h3>Current Status: {orderStatus}</h3>
                  <p>{getStatusDescription(orderStatus)}</p>
                  <div className="status-meta">
                    <span className="meta-item">📅 Estimated Delivery: {estimatedDelivery}</span>
                    <span className="meta-item">⏱️ Next Update: {getEstimatedTime(orderStatus)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="status-actions">
              <button className="btn btn-primary">Track Package</button>
              <button className="btn btn-outline">Contact Support</button>
              <button className="btn btn-text">View Order Details</button>
            </div>
          </motion.div>

          <motion.div 
            className="order-summary-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2>Order Summary</h2>
            
            <div className="order-items-list">
              {orderItems.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  </div>
                  <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>${orderItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>$49.99</span>
              </div>
              <div className="total-row">
                <span>Shipping Insurance</span>
                <span>$29.99</span>
              </div>
              <div className="total-row">
                <span>Tax (8%)</span>
                <span>${(orderItems.reduce((total, item) => total + (item.price * item.quantity), 0) * 0.08).toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="shipping-info">
              <h3>Shipping Information</h3>
              <div className="shipping-details">
                <p><strong>John Doe</strong></p>
                <p>1234 Gaming Street</p>
                <p>Los Angeles, CA 90001</p>
                <p>United States</p>
                <p>📧 john.doe@example.com</p>
                <p>📱 (555) 123-4567</p>
              </div>
            </div>

            <div className="support-info">
              <h3>Need Help?</h3>
              <div className="support-options">
                <div className="support-option">
                  <span className="option-icon">📞</span>
                  <div>
                    <h4>Call Support</h4>
                    <p>1-800-LAN-FORGE</p>
                  </div>
                </div>
                <div className="support-option">
                  <span className="option-icon">💬</span>
                  <div>
                    <h4>Live Chat</h4>
                    <p>Available 24/7</p>
                  </div>
                </div>
                <div className="support-option">
                  <span className="option-icon">📧</span>
                  <div>
                    <h4>Email</h4>
                    <p>support@lanforge.co</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="navigation-actions">
              <Link to="/" className="btn btn-secondary">Continue Shopping</Link>
              <Link to="/account/orders" className="btn btn-outline">View All Orders</Link>
            </div>
          </motion.div>
        </div>

        {/* Status Selector for Demo */}
        <div className="demo-controls">
          <h3>Demo: Change Order Status</h3>
          <div className="status-buttons">
            {[...statusLevels, ...specialStatuses].map((status) => (
              <button
                key={status}
                className={`status-btn ${orderStatus === status ? 'active' : ''}`}
                onClick={() => setOrderStatus(status)}
                style={{
                  backgroundColor: orderStatus === status ? getStatusColor(status) : 'rgba(255, 255, 255, 0.05)',
                  borderColor: getStatusColor(status)
                }}
              >
                {status}
              </button>
            ))}
          </div>
          <p className="demo-note">Note: This is a demo control. In a real application, status would be updated automatically.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;