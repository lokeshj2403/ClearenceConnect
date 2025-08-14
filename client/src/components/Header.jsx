import React, { useState } from 'react';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartDropdown from './CartDropdown';

const Header = ({ onShowLogin, onShowRegister, currentPage, onNavigate, user }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getItemCount } = useCart();

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
    setIsAccountOpen(false);
  };

  const toggleAccount = () => {
    setIsAccountOpen(!isAccountOpen);
    setIsCartOpen(false);
  };

  const closeDropdowns = () => {
    setIsCartOpen(false);
    setIsAccountOpen(false);
  };

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-[#FF4C4C]">
              Clearance Connect
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#categories" className="text-gray-700 hover:text-[#FF4C4C] transition-colors">
              Categories
            </a>
            <a href="#deals" className="text-gray-700 hover:text-[#FF4C4C] transition-colors">
              Deals
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-[#FF4C4C] transition-colors">
              How It Works
            </a>
            <a href="#about" className="text-gray-700 hover:text-[#FF4C4C] transition-colors">
              About
            </a>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C] focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={toggleAccount}
                className="flex items-center space-x-2 text-gray-700 hover:text-[#FF4C4C] transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Account</span>
              </button>
              {isAccountOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        onShowLogin();
                        closeDropdowns();
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <User className="h-4 w-4" />
                      <span>Sign In</span>
                    </button>
                    <button 
                      onClick={() => {
                        onShowRegister();
                        closeDropdowns();
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <User className="h-4 w-4" />
                      <span>Create Account</span>
                    </button>
                    <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="h-4 w-4" />
                      <span onClick={() => onNavigate('admin-panel')}>Admin Panel</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="h-4 w-4" />
                      <span onClick={() => onNavigate('customer-orders')}>My Orders</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="h-4 w-4" />
                      <span>Wishlist</span>
                    </a>
                    {user?.userType === 'seller' && (
                      <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="h-4 w-4" />
                        <span onClick={() => onNavigate('seller-dashboard')}>Seller Dashboard</span>
                      </a>
                    )}
                    <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="h-4 w-4" />
                      <span>Settings</span>
                    </a>
                    <div className="h-px bg-gray-100 my-2"></div>
                    <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="h-4 w-4" />
                      <span>Sign Out</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Dropdown */}
            <div className="relative">
              <button
                onClick={toggleCart}
                className="flex items-center space-x-2 text-gray-700 hover:text-[#FF4C4C] transition-colors"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#FF4C4C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Cart</span>
              </button>
              {isCartOpen && <CartDropdown onClose={closeDropdowns} />}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-[#FF4C4C]"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C] focus:border-transparent"
                />
              </div>
              <nav className="flex flex-col space-y-2">
                <a href="#categories" className="text-gray-700 hover:text-[#FF4C4C] transition-colors py-2">
                  Categories
                </a>
                <a href="#deals" className="text-gray-700 hover:text-[#FF4C4C] transition-colors py-2">
                  Deals
                </a>
                <a href="#how-it-works" className="text-gray-700 hover:text-[#FF4C4C] transition-colors py-2">
                  How It Works
                </a>
                <a href="#about" className="text-gray-700 hover:text-[#FF4C4C] transition-colors py-2">
                  About
                </a>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(isCartOpen || isAccountOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeDropdowns}
        />
      )}
    </header>
  );
};

export default Header;