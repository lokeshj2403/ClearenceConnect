import React from 'react';
import { Shield, Truck } from 'lucide-react';

const Hero = ({ onStartShopping, onBecomeSeller }) => {
  return (
    <section className="pt-16 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-24">
          <div className="max-w-2xl">
            <span className="inline-block text-[#FF4C4C] font-semibold mb-4 tracking-wider">
              CLEARANCE DEALS
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Discover Premium Products at Unbeatable Prices
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Join thousands of smart shoppers and sellers on the platform where quality meets affordability. 
              Experience up to 70% off on premium brands.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <button 
                onClick={onStartShopping}
                className="bg-[#FF4C4C] text-white px-10 py-4 rounded-lg font-medium hover:bg-[#FF4C4C]/90 shadow-lg shadow-[#FF4C4C]/20 transition-all"
              >
                Start Shopping
              </button>
              <button 
                onClick={onBecomeSeller}
                className="bg-white border-2 border-gray-200 px-10 py-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Become a Seller
              </button>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center bg-[#FF4C4C]/10 rounded-full text-[#FF4C4C]">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-gray-600">Secure Shopping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center bg-[#FF4C4C]/10 rounded-full text-[#FF4C4C]">
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-gray-600">Fast Delivery</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <img
              src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800"
              className="w-full rounded-2xl shadow-2xl"
              alt="Featured Products"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;