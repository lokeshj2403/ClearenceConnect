import React from 'react';
import { Facebook, Twitter, Instagram, CreditCard } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">About Us</h3>
            <p className="mb-6">
              Clearance Connect is your premier destination for amazing deals on quality products.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Customer Service</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Order Status</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Newsletter</h3>
            <p className="mb-4">
              Subscribe to receive updates about new deals and exclusive offers.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-gray-800 border-none rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
              />
              <button className="bg-[#FF4C4C] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#FF4C4C]/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {currentYear} Clearance Connect. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-white" />
              <span className="text-sm">Secure payments accepted</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;