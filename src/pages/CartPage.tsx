import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCreditCard, faBuilding, faMobile, faLock, faTruck, faShieldAlt, faUndo } from '@fortawesome/free-solid-svg-icons';
import '../App.css';

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

const CartPage: React.FC = () => {
  // Mock cart data - in a real app, this would come from a state management system
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'LANForge Gaming PC Pro',
      description: 'High-performance gaming PC with RTX 4080, Intel i9-14900K, 32GB DDR5',
      price: 2499.99,
      quantity: 1,
      image: 'https://lanforge.co/cdn/shop/files/Tradeify-CEO.png?v=1763949594&width=400',
      category: 'Pre-built PC'
    },
    {
      id: 2,
      name: 'Custom Water Cooling Kit',
      description: 'Complete custom loop water cooling kit with RGB lighting',
      price: 399.99,
      quantity: 1,
      image: 'https://lanforge.co/cdn/shop/files/logo2.png?height=120&v=1763939118',
      category: 'Accessory'
    },
    {
      id: 3,
      name: 'Mechanical Gaming Keyboard',
      description: 'RGB mechanical keyboard with Cherry MX switches',
      price: 129.99,
      quantity: 2,
      image: 'https://lanforge.co/cdn/shop/files/logo2.png?height=120&v=1763939118',
      category: 'Peripheral'
    }
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) {
      // Remove item if quantity is 0
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    return cartItems.length > 0 ? 49.99 : 0; // Flat rate shipping
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/checkout';
  };

  return (
    <div className="cart-page">
      <div className="container-narrow">
        <motion.div 
          className="cart-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1>Your Shopping Cart</h1>
          <p className="cart-subtitle">Review your items and proceed to checkout</p>
        </motion.div>

        <div className="cart-layout">
          <motion.div 
            className="cart-items"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-4xl" />
                </div>
                <h2>Your cart is empty</h2>
                <p>Add some awesome PC components to get started!</p>
                <Link to="/configurator" className="btn btn-primary">
                  Start Building Your PC
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-items-header">
                  <h2>Items ({cartItems.length})</h2>
                  <button 
                    className="btn btn-text"
                    onClick={() => setCartItems([])}
                  >
                    Clear All
                  </button>
                </div>
                
                {cartItems.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    className="cart-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                  >
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-header">
                        <h3>{item.name}</h3>
                        <span className="cart-item-category">{item.category}</span>
                      </div>
                      <p className="cart-item-description">{item.description}</p>
                      <div className="cart-item-actions">
                        <div className="quantity-selector">
                          <button 
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button 
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="btn btn-text btn-danger"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-price">
                      <div className="price-amount">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="price-unit">${item.price.toFixed(2)} each</div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>

          <motion.div 
            className="cart-summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2>Order Summary</h2>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>${calculateShipping().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (8%)</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>
              
              <Link to="/configurator" className="btn btn-secondary">
                Continue Shopping
              </Link>
              
              <div className="payment-methods">
                <p>Secure payment with:</p>
                <div className="payment-icons">
                  <span><FontAwesomeIcon icon={faCreditCard} /></span>
                  <span><FontAwesomeIcon icon={faBuilding} /></span>
                  <span><FontAwesomeIcon icon={faMobile} /></span>
                  <span><FontAwesomeIcon icon={faLock} /></span>
                </div>
              </div>
            </div>

            <div className="summary-features">
              <div className="feature">
                <span className="feature-icon"><FontAwesomeIcon icon={faTruck} /></span>
                <div>
                  <h4>Free Shipping</h4>
                  <p>On orders over $2000</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon"><FontAwesomeIcon icon={faShieldAlt} /></span>
                <div>
                  <h4>1-Year Warranty</h4>
                  <p>All systems include warranty</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon"><FontAwesomeIcon icon={faUndo} /></span>
                <div>
                  <h4>30-Day Returns</h4>
                  <p>Hassle-free returns</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;