import React, { useState } from 'react';
import { ShoppingCart, User, Search, Menu, X, ArrowLeft } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedDeals from './components/FeaturedDeals';
import HowItWorks from './components/HowItWorks';
import Benefits from './components/Benefits';
import Testimonials from './components/Testimonials';
import About from './components/About';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ShoppingPage from './components/ShoppingPage';
import SellerRegistration from './components/SellerRegistration';
import SellerDashboard from './components/SellerDashboard';
import CustomerOrders from './components/CustomerOrders';
import AdminPanel from './components/AdminPanel';
import { CartProvider } from './context/CartContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [user, setUser] = useState(null);

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const handleShowLogin = () => {
    setShowLoginModal(true);
  };

  const handleShowRegister = () => {
    setShowRegisterModal(true);
  };

  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'shopping':
        return <ShoppingPage onBack={() => setCurrentPage('home')} />;
      case 'seller-registration':
        return <SellerRegistration onBack={() => setCurrentPage('home')} />;
      case 'seller-dashboard':
        return <SellerDashboard onBack={() => setCurrentPage('home')} />;
      case 'customer-orders':
        return <CustomerOrders onBack={() => setCurrentPage('home')} />;
      case 'admin-panel':
        return <AdminPanel onBack={() => setCurrentPage('home')} />;
      default:
        return (
          <main>
            <Hero onStartShopping={() => setCurrentPage('shopping')} onBecomeSeller={() => setCurrentPage('seller-registration')} />
            <Categories />
            <FeaturedDeals />
            <HowItWorks />
            <Benefits />
            <Testimonials />
            <About />
            <Newsletter />
          </main>
        );
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header 
          onShowLogin={handleShowLogin} 
          onShowRegister={handleShowRegister}
          currentPage={currentPage}
          onNavigate={handleNavigation}
          user={user}
        />
        {renderCurrentPage()}
        {currentPage === 'home' && <Footer />}
        
        {showLoginModal && (
          <LoginModal 
            onClose={handleCloseModals} 
            onSwitchToRegister={() => {
              setShowLoginModal(false);
              setShowRegisterModal(true);
            }}
          />
        )}
        
        {showRegisterModal && (
          <RegisterModal 
            onClose={handleCloseModals} 
            onSwitchToLogin={() => {
              setShowRegisterModal(false);
              setShowLoginModal(true);
            }}
          />
        )}
      </div>
    </CartProvider>
  );
}

export default App;