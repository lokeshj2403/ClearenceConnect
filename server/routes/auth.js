/**
 * Authentication Routes
 * ---------------------
 * Handles user authentication and account-related actions.
 *
 * Features:
 * - User registration (Customer / Seller)
 * - Login
 * - Get current user profile
 * - Logout
 * - Forgot password (send reset token)
 * - Reset password
 *
 * Tech Stack:
 * - bcryptjs: For password hashing
 * - jsonwebtoken: For authentication via JWT
 * - express-validator: For request body validation
 * - Custom MongoDB User model
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const User = require("../models/User.js"); // Your Mongoose User model
const auth = require("../middleware/auth.js"); // Auth middleware for protected routes

// Create Express router
const router = express.Router();

/**
 * ==========================================================
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * ==========================================================
 */
router.post(
  "/register",
  [
    // Validation rules
    body("firstName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name must be between 1 and 50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("userType")
      .isIn(["customer", "seller"])
      .withMessage("User type must be either customer or seller"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, email, password, userType, companyName } =
        req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Create user data object
      const userData = {
        firstName,
        lastName,
        email,
        password,
        userType,
      };

      // Extra seller info
      if (userType === "seller" && companyName) {
        userData.sellerInfo = { companyName, isVerified: false };
      }

      // Create and save user
      const user = new User(userData);
      await user.save();

      // Create JWT token
      const token = jwt.sign(
        { userId: user._id, userType: user.userType },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      // Remove password before sending response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { user: userResponse, token },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res
        .status(500)
        .json({ success: false, message: "Server error during registration" });
    }
  }
);

/**
 * ==========================================================
 * @route   POST /api/auth/login
 * @desc    Login and get JWT token
 * @access  Public
 * ==========================================================
 */
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user (with password)
      const user = await User.findByEmail(email).select("+password");
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: "Account is temporarily locked",
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Please contact support.",
        });
      }

      // Validate password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      // Reset failed login attempts if any
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id, userType: user.userType },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      // Remove sensitive fields
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.loginAttempts;
      delete userResponse.lockUntil;

      res.json({
        success: true,
        message: "Login successful",
        data: { user: userResponse, token },
      });
    } catch (error) {
      console.error("Login error:", error);
      res
        .status(500)
        .json({ success: false, message: "Server error during login" });
    }
  }
);

/**
 * ==========================================================
 * @route   GET /api/auth/me
 * @desc    Get logged-in user's profile
 * @access  Private
 * ==========================================================
 */
router.get("/me", auth, async (req, res) => {
  try {
    // req.user comes from auth middleware
    const user = await User.findById(req.user.userId).populate(
      "wishlist",
      "name images salePrice originalPrice"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching profile" });
  }
});

/**
 * ==========================================================
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 * ==========================================================
 */
router.post("/logout", auth, async (req, res) => {
  try {
    // With JWT, logout is done client-side by deleting token
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during logout" });
  }
});

/**
 * ==========================================================
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset token
 * @access  Public
 * ==========================================================
 */
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  async (req, res) => {
    try {
      // Validate email
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        // Don't reveal if user exists
        return res.json({
          success: true,
          message: "If account exists, a reset link has been sent",
        });
      }

      // Create reset token
      const resetToken = jwt.sign(
        { userId: user._id, purpose: "password-reset" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Save token in DB
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      // TODO: Send resetToken via email

      res.json({
        success: true,
        message: "Password reset link sent to your email",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while processing request",
      });
    }
  }
);

/**
 * ==========================================================
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 * ==========================================================
 */
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { token, newPassword } = req.body;

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired reset token" });
      }

      // Find user with matching token
      const user = await User.findOne({
        _id: decoded.userId,
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired reset token" });
      }

      // Update password
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while resetting password",
      });
    }
  }
);

// Export router for use in server.js
module.exports = router;
