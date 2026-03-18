import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../App.css';

const CheckoutPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'shipping' | 'billing' | 'shippingMethod' | 'donation' | 'payment'>('shipping');
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [donationOption, setDonationOption] = useState<'none' | 'roundup' | 'fixed' | 'custom'>('none');
  const [customDonation, setCustomDonation] = useState('');
  const [shippingInsurance, setShippingInsurance] = useState(true);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard');
  const [discountCode, setDiscountCode] = useState('');

  const cartItems = [
    { id: 1, name: 'LANForge Gaming PC Pro', price: 2499.99, quantity: 1 },
    { id: 2, name: 'Custom Water Cooling Kit', price: 399.99, quantity: 1 },
    { id: 3, name: 'Mechanical Gaming Keyboard', price: 129.99, quantity: 2 }
  ];

  const calculateSubtotal = () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const calculateTax = () => calculateSubtotal() * 0.08;
  const calculateShipping = () => {
    switch (shippingMethod) {
      case 'standard': return 49.99;
      case 'express': return 79.99;
      case 'overnight': return 129.99;
      default: return 49.99;
    }
  };
  const calculateInsurance = () => shippingInsurance ? 29.99 : 0;
  const calculateDonation = () => {
    switch (donationOption) {
      case 'roundup':
        const totalBeforeDonation = calculateSubtotal() + calculateTax() + calculateShipping() + calculateInsurance();
        return Math.ceil(totalBeforeDonation) - totalBeforeDonation;
      case 'fixed': return 5.00;
      case 'custom': return parseFloat(customDonation) || 0;
      default: return 0;
    }
  };
  const calculateTotal = () => calculateSubtotal() + calculateTax() + calculateShipping() + calculateInsurance() + calculateDonation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to order status page
    window.location.href = '/order-status';
  };

  const handleSectionComplete = (section: string) => {
    setCompletedSections(prev => new Set(prev).add(section));
    const sections: ('shipping' | 'billing' | 'shippingMethod' | 'donation' | 'payment')[] = ['shipping', 'billing', 'shippingMethod', 'donation', 'payment'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1]);
    }
  };

  const handleEditSection = (section: string) => {
    setActiveSection(section as any);
  };

  const isSectionCompleted = (section: string) => completedSections.has(section);
  const isSectionActive = (section: string) => activeSection === section;

  return (
    <div className="checkout-page">
      <div className="container">
        <motion.div className="checkout-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1>Checkout</h1>
          <p className="checkout-subtitle">Complete your purchase securely</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-layout">
            <div className="checkout-forms">
              <div className="checkout-progress">
                {['shipping', 'billing', 'shippingMethod', 'donation', 'payment'].map((section, index) => (
                  <div key={section} className="progress-step">
                    <div className={`step-indicator ${isSectionCompleted(section) ? 'completed' : ''} ${isSectionActive(section) ? 'active' : ''}`}>
                      {isSectionCompleted(section) ? '✓' : index + 1}
                    </div>
                    <div className="step-info">
                      <span className="step-title">
                        {section === 'shipping' && 'Shipping Address'}
                        {section === 'billing' && 'Billing Address'}
                        {section === 'shippingMethod' && 'Shipping Method'}
                        {section === 'donation' && 'Donation'}
                        {section === 'payment' && 'Payment'}
                      </span>
                      {isSectionCompleted(section) && !isSectionActive(section) && (
                        <button type="button" className="step-edit" onClick={() => handleEditSection(section)}>Edit</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isSectionActive('shipping') && (
                <motion.div className="checkout-section" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <div className="section-header">
                    <h2>Shipping Address</h2>
                    <button type="button" className="btn btn-outline btn-small" onClick={() => handleSectionComplete('shipping')}>Continue</button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group"><label>First Name *</label><input type="text" required /></div>
                    <div className="form-group"><label>Last Name *</label><input type="text" required /></div>
                    <div className="form-group"><label>Email *</label><input type="email" required /></div>
                    <div className="form-group"><label>Phone *</label><input type="tel" required /></div>
                    <div className="form-group col-span-2"><label>Address *</label><input type="text" required /></div>
                    <div className="form-group"><label>Apartment, suite, etc.</label><input type="text" /></div>
                    <div className="form-group"><label>City *</label><input type="text" required /></div>
                    <div className="form-group"><label>State *</label><select required><option value="">Select State</option><option value="CA">California</option></select></div>
                    <div className="form-group"><label>ZIP Code *</label><input type="text" required /></div>
                    <div className="form-group"><label>Country *</label><select required><option value="United States">United States</option></select></div>
                  </div>
                </motion.div>
              )}

              {isSectionActive('billing') && (
                <motion.div className="checkout-section" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <div className="section-header">
                    <h2>Billing Address</h2>
                    <button type="button" className="btn btn-outline btn-small" onClick={() => handleSectionComplete('billing')}>Continue</button>
                  </div>
                  <div className="checkbox-label">
                    <input type="checkbox" checked={useSameAddress} onChange={(e) => setUseSameAddress(e.target.checked)} />
                    Same as shipping address
                  </div>
                </motion.div>
              )}

              {isSectionActive('shippingMethod') && (
                <motion.div className="checkout-section" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <div className="section-header">
                    <h2>Shipping Method</h2>
                    <button type="button" className="btn btn-outline btn-small" onClick={() => handleSectionComplete('shippingMethod')}>Continue</button>
                  </div>
                  <div className="shipping-options">
                    <label className={`shipping-option ${shippingMethod === 'standard' ? 'selected' : ''}`}>
                      <input type="radio" name="shippingMethod" value="standard" checked={shippingMethod === 'standard'} onChange={(e) => setShippingMethod(e.target.value as any)} />
                      <div className="option-content">
                        <div className="option-header"><span className="option-title">Standard Shipping</span><span className="option-price">${calculateShipping().toFixed(2)}</span></div>
                        <p className="option-description">5-7 business days</p>
                      </div>
                    </label>
                    <label className={`shipping-option ${shippingMethod === 'express' ? 'selected' : ''}`}>
                      <input type="radio" name="shippingMethod" value="express" checked={shippingMethod === 'express'} onChange={(e) => setShippingMethod(e.target.value as any)} />
                      <div className="option-content">
                        <div className="option-header"><span className="option-title">Express Shipping</span><span className="option-price">$79.99</span></div>
                        <p className="option-description">2-3 business days</p>
                      </div>
                    </label>
                    <label className={`shipping-option ${shippingMethod === 'overnight' ? 'selected' : ''}`}>
                      <input type="radio" name="shippingMethod" value="overnight" checked={shippingMethod === 'overnight'} onChange={(e) => setShippingMethod(e.target.value as any)} />
                      <div className="option-content">
                        <div className="option-header"><span className="option-title">Overnight Shipping</span><span className="option-price">$129.99</span></div>
                        <p className="option-description">Next business day</p>
                      </div>
                    </label>
                  </div>
                  <label className="checkbox-label insurance-checkbox">
                    <input type="checkbox" checked={shippingInsurance} onChange={(e) => setShippingInsurance(e.target.checked)} />
                    <div><span className="checkbox-title">Add Shipping Insurance</span><span className="checkbox-price">+ $29.99</span><p className="checkbox-description">Protect your order during shipping</p></div>
                  </label>
                </motion.div>
              )}

              {isSectionActive('donation') && (
                <motion.div className="checkout-section" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <div className="section-header">
                    <h2>Optional: Support Gaming Education</h2>
                    <button type="button" className="btn btn-outline btn-small" onClick={() => handleSectionComplete('donation')}>Skip</button>
                  </div>
                  <div className="donation-content">
                    <div className="donation-image">
                      <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Gaming Education Initiative" />
                      <div className="image-caption">Supporting the next generation of gamers</div>
                    </div>
                    <p className="donation-description">LANForge contributes to gaming education initiatives with every purchase. Your donation helps provide gaming equipment and educational resources to underserved communities.</p>
                    <div className="donation-options">
                      <label className={`donation-option ${donationOption === 'none' ? 'selected' : ''}`}>
                        <input type="radio" name="donationOption" value="none" checked={donationOption === 'none'} onChange={(e) => setDonationOption(e.target.value as any)} />
                        <span className="option-title">No additional donation</span>
                      </label>
                      <label className={`donation-option ${donationOption === 'roundup' ? 'selected' : ''}`}>
                        <input type="radio" name="donationOption" value="roundup" checked={donationOption === 'roundup'} onChange={(e) => setDonationOption(e.target.value as any)} />
                        <span className="option-title">Round up to nearest dollar</span>
                      </label>
                      <label className={`donation-option ${donationOption === 'fixed' ? 'selected' : ''}`}>
                        <input type="radio" name="donationOption" value="fixed" checked={donationOption === 'fixed'} onChange={(e) => setDonationOption(e.target.value as any)} />
                        <span className="option-title">Add $5 donation</span>
                      </label>
                      <label className={`donation-option ${donationOption === 'custom' ? 'selected' : ''}`}>
                        <input type="radio" name="donationOption" value="custom" checked={donationOption === 'custom'} onChange={(e) => setDonationOption(e.target.value as any)} />
                        <span className="option-title">Custom amount</span>
                        <div className="custom-donation-input"><span>$</span><input type="number" min="0" step="0.01" value={customDonation} onChange={(e) => setCustomDonation(e.target.value)} placeholder="10.00" disabled={donationOption !== 'custom'} /></div>
                      </label>
                    </div>
                    {donationOption !== 'none' && (
                      <div className="donation-action">
                        <button type="button" className="btn btn-outline btn-small" onClick={() => handleSectionComplete('donation')}>Continue with ${calculateDonation().toFixed(2)} donation</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {isSectionActive('payment') && (
                <motion.div className="checkout-section" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                  <div className="section-header">
                    <h2>Payment Information</h2>
                  </div>
                  <div className="form-grid">
                    <div className="form-group col-span-2"><label>Card Number *</label><input type="text" placeholder="1234 5678 9012 3456" required /></div>
                    <div className="form-group col-span-2"><label>Name on Card *</label><input type="text" placeholder="John Doe" required /></div>
                    <div className="form-group"><label>Expiry Date *</label><input type="text" placeholder="MM/YY" required /></div>
                    <div className="form-group"><label>CVV *</label><input type="text" placeholder="123" required /></div>
                  </div>
                  <div className="payment-security"><span className="security-icon">🔒</span><span>Your payment information is encrypted and secure</span></div>
                </motion.div>
              )}
            </div>

            <motion.div className="checkout-summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
              <h2>Order Summary</h2>
              <div className="order-items">
                <h3>Items ({cartItems.length})</h3>
                {cartItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-info"><span className="item-name">{item.name}</span><span className="item-quantity">Qty: {item.quantity}</span></div>
                    <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="discount-section">
                <h3>Discount Code</h3>
                <div className="discount-input"><input type="text" placeholder="Enter discount code" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} /><button type="button" className="btn btn-outline">Apply</button></div>
              </div>
              <div className="order-totals">
                <div className="total-row"><span>Subtotal</span><span>${calculateSubtotal().toFixed(2)}</span></div>
                <div className="total-row"><span>Shipping</span><span>${calculateShipping().toFixed(2)}</span></div>
                <div className="total-row"><span>Shipping Insurance</span><span>${calculateInsurance().toFixed(2)}</span></div>
                <div className="total-row"><span>Tax (8%)</span><span>${calculateTax().toFixed(2)}</span></div>
                <div className="total-row donation-row"><span>LANForge Donation</span><span>${calculateDonation().toFixed(2)}</span></div>
                <div className="total-row grand-total"><span>Total</span><span>${calculateTotal().toFixed(2)}</span></div>
              </div>
              <button type="submit" className="btn btn-primary btn-large">Place Order • ${calculateTotal().toFixed(2)}</button>
              <div className="security-info">
                <div className="security-item"><span className="security-icon">🔒</span><span>256-bit SSL encryption</span></div>
                <div className="security-item"><span className="security-icon">🛡️</span><span>PCI DSS compliant</span></div>
                <div className="security-item"><span className="security-icon">↩️</span><span>30-day return policy</span></div>
              </div>
              <Link to="/cart" className="btn btn-text">← Back to Cart</Link>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;