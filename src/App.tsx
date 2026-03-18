import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Intercom from '@intercom/messenger-js-sdk';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ConfiguratorPage from './pages/ConfiguratorPage';
import ProductsPage from './pages/ProductsPage';
import PCsPage from './pages/PCsPage';
import WarrantyPage from './pages/WarrantyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderStatusPage from './pages/OrderStatusPage';
import PlaceholderPage from './pages/PlaceholderPage';
import AccessoriesPage from './pages/AccessoriesPage';
import ShippingReturnsPage from './pages/ShippingReturnsPage';
import ReviewsPage from './pages/ReviewsPage';
import PressPage from './pages/PressPage';
import FAQPage from './pages/FAQPage';
import TechSupportPage from './pages/TechSupportPage';
import PCServicesPage from './pages/PCServicesPage';
import PartnersPage from './pages/PartnersPage';
import AffiliateApplicationPage from './pages/AffiliateApplicationPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminPendingOrdersPage from './pages/AdminPendingOrdersPage';
import AdminCompletedOrdersPage from './pages/AdminCompletedOrdersPage';
import AdminCancelledOrdersPage from './pages/AdminCancelledOrdersPage';
import AdminAddProductPage from './pages/AdminAddProductPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminInventoryPage from './pages/AdminInventoryPage';
import AdminAddCustomerPage from './pages/AdminAddCustomerPage';
import AdminLoyaltyPage from './pages/AdminLoyaltyPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminDiscountsPage from './pages/AdminDiscountsPage';
import AdminEmailCampaignsPage from './pages/AdminEmailCampaignsPage';

function App() {
  // Initialize Intercom on component mount
  useEffect(() => {
    Intercom({
      app_id: 'ngo9fpbi',
    });
  }, []);

  return (
    <Router>
      <div className="App">
        <ScrollToTop />
        <ScrollProgress />
        <Routes>
          <Route path="/" element={
            <>
              <Header />
              <HomePage />
              <Footer />
            </>
          } />
          <Route path="/configurator" element={
            <>
              <Header />
              <ConfiguratorPage />
              <Footer />
            </>
          } />
          <Route path="/products" element={
            <>
              <Header />
              <ProductsPage />
              <Footer />
            </>
          } />
          <Route path="/products/:productId" element={
            <>
              <Header />
              <ProductsPage />
              <Footer />
            </>
          } />
          <Route path="/pcs" element={
            <>
              <Header />
              <PCsPage />
              <Footer />
            </>
          } />
          <Route path="/warranty" element={
            <>
              <Header />
              <WarrantyPage />
              <Footer />
            </>
          } />
          <Route path="/terms" element={
            <>
              <Header />
              <TermsOfServicePage />
              <Footer />
            </>
          } />
          <Route path="/privacy" element={
            <>
              <Header />
              <PrivacyPolicyPage />
              <Footer />
            </>
          } />
          <Route path="/contact" element={
            <>
              <Header />
              <ContactPage />
              <Footer />
            </>
          } />
          <Route path="/cart" element={
            <>
              <Header />
              <CartPage />
              <Footer />
            </>
          } />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-status" element={<OrderStatusPage />} />
          <Route path="/accessories" element={
            <>
              <Header />
              <AccessoriesPage />
              <Footer />
            </>
          } />
          <Route path="/faq" element={
            <>
              <Header />
              <FAQPage />
              <Footer />
            </>
          } />
          <Route path="/shipping" element={
            <>
              <Header />
              <ShippingReturnsPage />
              <Footer />
            </>
          } />
          <Route path="/guides" element={
            <>
              <Header />
              <PlaceholderPage title="Build Guides" description="Step-by-step guides for building your PC" />
              <Footer />
            </>
          } />
          <Route path="/about" element={
            <>
              <Header />
              <PlaceholderPage title="About Us" description="Learn more about LANForge" />
              <Footer />
            </>
          } />
          <Route path="/reviews" element={
            <>
              <Header />
              <ReviewsPage />
              <Footer />
            </>
          } />
          <Route path="/careers" element={
            <>
              <Header />
              <PlaceholderPage title="Careers" description="Join the LANForge team" />
              <Footer />
            </>
          } />
          <Route path="/press" element={
            <>
              <Header />
              <PressPage />
              <Footer />
            </>
          } />
          <Route path="/blog" element={
            <>
              <Header />
              <PlaceholderPage title="Blog" description="Latest news and articles" />
              <Footer />
            </>
          } />
          <Route path="/cookies" element={
            <>
              <Header />
              <CookiePolicyPage />
              <Footer />
            </>
          } />
          <Route path="/tech-support" element={
            <>
              <Header />
              <TechSupportPage />
              <Footer />
            </>
          } />
          <Route path="/pc-services" element={
            <>
              <Header />
              <PCServicesPage />
              <Footer />
            </>
          } />
          <Route path="/partners" element={
            <>
              <Header />
              <PartnersPage />
              <Footer />
            </>
          } />
          <Route path="/affiliate-application" element={
            <>
              <Header />
              <AffiliateApplicationPage />
              <Footer />
            </>
          } />
          {/* Admin Routes - No Header/Footer */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders/pending" element={<AdminPendingOrdersPage />} />
          <Route path="/admin/orders/completed" element={<AdminCompletedOrdersPage />} />
          <Route path="/admin/orders/cancelled" element={<AdminCancelledOrdersPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/products/add" element={<AdminAddProductPage />} />
          <Route path="/admin/products/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/products/inventory" element={<AdminInventoryPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/customers/add" element={<AdminAddCustomerPage />} />
          <Route path="/admin/customers/loyalty" element={<AdminLoyaltyPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/discounts" element={<AdminDiscountsPage />} />
          <Route path="/admin/email-campaigns" element={<AdminEmailCampaignsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
