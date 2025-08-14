import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginModal = ({ onClose, onSwitchToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', formData);
  };

  const handleSocialLogin = (provider) => {
    // Handle social login logic here
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your Clearance Connect account</p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-4">
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
              <span className="font-medium text-gray-700">Continue with Google</span>
            </button>
            <button
              onClick={() => handleSocialLogin('facebook')}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-medium">Continue with Facebook</span>
            </button>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C] focus:border-transparent text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C] focus:border-transparent text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="h-4 w-4 text-[#FF4C4C] focus:ring-[#FF4C4C] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#FF4C4C] hover:text-[#FF4C4C]/80">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF4C4C] text-white py-2.5 rounded-lg font-medium hover:bg-[#FF4C4C]/90 transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-[#FF4C4C] hover:text-[#FF4C4C]/80 font-medium"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;