import React, { useState } from "react";
import {
  X, Mail, Lock, Eye, EyeOff, User, Building,
} from "lucide-react";

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  // UI state controls
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account type (customer / seller)
  const [accountType, setAccountType] = useState("customer");

  // Status messages for success/error
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // success / error

  // Loading state for submit button
  const [loading, setLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  /**
   * Shows a temporary message on screen
   * @param {string} message - Message text
   * @param {string} type - 'success' or 'error'
   */
  const showMessage = (message, type) => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage("");
      setStatusType("");
    }, 3000); // Message disappears after 3s
  };

  /**
   * Handles registration form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic password match validation
    if (formData.password !== formData.confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      // API request to backend register endpoint
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Required fields
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName:
            accountType === "seller" ? formData.companyName : undefined,
          email: formData.email,
          password: formData.password,
          userType: accountType, // ✅ backend expects "userType"
        }),
      });

      const data = await response.json();

      // If registration was successful
      if (response.ok && data.success) {
        showMessage("Successfully registered!", "success");

        // Reset form after successful registration
        setFormData({
          firstName: "",
          lastName: "",
          companyName: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreeToTerms: false,
        });
      } else {
        // Show specific error from backend
        showMessage(data.message || "Registration failed", "error");
      }
    } catch (error) {
      // If backend is not reachable
      showMessage("Server error. Please try again.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8">
          {/* Modal Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">Join Clearance Connect today</p>
          </div>

          {/* Show status messages */}
          {statusMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-center font-medium ${
                statusType === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {statusMessage}
            </div>
          )}

          {/* Choose account type */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setAccountType("customer")}
              className={`flex-1 py-2 rounded-lg border ${
                accountType === "customer"
                  ? "border-[#FF4C4C] bg-[#FF4C4C] text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setAccountType("seller")}
              className={`flex-1 py-2 rounded-lg border ${
                accountType === "seller"
                  ? "border-[#FF4C4C] bg-[#FF4C4C] text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Seller
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C] focus:border-transparent"
                  placeholder="First name"
                  required
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C] focus:border-transparent"
                placeholder="Last name"
                required
              />
            </div>

            {/* Company Name - Only for Seller */}
            {accountType === "seller" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C] focus:border-transparent"
                  placeholder="Your company name"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C] focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C] focus:border-transparent"
                  placeholder="Create a password"
                  required
                />
                {/* Show/hide password button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C] focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
                {/* Show/hide confirm password button */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreeToTerms: e.target.checked })
                }
                className="h-4 w-4 text-[#FF4C4C] border-gray-300 rounded mt-1"
                required
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-[#FF4C4C] hover:text-[#FF4C4C]/80">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#FF4C4C] hover:text-[#FF4C4C]/80">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#FF4C4C] text-white py-3 rounded-lg font-medium hover:bg-[#FF4C4C]/90 transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading
                ? "Registering..."
                : accountType === "seller"
                ? "Create Seller Account"
                : "Create Customer Account"}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-[#FF4C4C] hover:text-[#FF4C4C]/80 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
