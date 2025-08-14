/**
 * Admin Routes
 * 
 * Handles admin-specific operations:
 * - View seller applications
 * - Approve/reject seller applications
 * - Create seller accounts
 * - Manage platform settings
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user details
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is admin
    if (user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin authentication'
    });
  }
};

/**
 * @route   GET /api/admin/seller-applications
 * @desc    Get all seller applications with filtering
 * @access  Private (Admin only)
 * @query   { status?, page?, limit? }
 */
router.get('/seller-applications', [auth, adminAuth], async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    // Build query based on status
    let query = { userType: 'seller' };
    
    if (status === 'pending') {
      query['sellerInfo.applicationStatus'] = 'pending';
    } else if (status === 'approved') {
      query['sellerInfo.applicationStatus'] = 'approved';
    } else if (status === 'rejected') {
      query['sellerInfo.applicationStatus'] = 'rejected';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch applications
    const applications = await User.find(query)
      .select('firstName lastName email sellerInfo createdAt')
      .sort({ 'sellerInfo.appliedAt': -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Transform data for frontend
    const transformedApplications = applications.map(app => ({
      _id: app._id,
      companyName: app.sellerInfo?.companyName,
      companyType: app.sellerInfo?.companyType,
      gstNumber: app.sellerInfo?.gstNumber,
      panNumber: app.sellerInfo?.panNumber,
      contactPerson: `${app.firstName} ${app.lastName}`,
      email: app.email,
      phone: app.sellerInfo?.phone,
      businessCategory: app.sellerInfo?.businessCategory,
      productCategories: app.sellerInfo?.productCategories,
      status: app.sellerInfo?.applicationStatus,
      appliedAt: app.sellerInfo?.appliedAt,
      createdAt: app.createdAt,
      // Include all seller info for detailed view
      ...app.sellerInfo?.toObject()
    }));

    res.json({
      success: true,
      data: {
        applications: transformedApplications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get seller applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching seller applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/admin/seller-applications/:id/approve
 * @desc    Approve seller application and create seller account
 * @access  Private (Admin only)
 */
router.post('/seller-applications/:id/approve', [auth, adminAuth], async (req, res) => {
  try {
    const { id } = req.params;

    // Find the seller application
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Seller application not found'
      });
    }

    // Check if application is pending
    if (user.sellerInfo?.applicationStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application is not in pending status'
      });
    }

    // Generate random password for seller account
    const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const tempPassword = generatePassword();

    // Update user status to approved seller
    user.sellerInfo.applicationStatus = 'approved';
    user.sellerInfo.isVerified = true;
    user.sellerInfo.approvedAt = new Date();
    user.sellerInfo.approvedBy = req.user.userId;
    
    // Set temporary password (user should change on first login)
    user.password = tempPassword;
    user.isActive = true;

    await user.save();

    // Send email with login credentials
    try {
      await sendSellerCredentials(user.email, user.sellerInfo.companyName, user.email, tempPassword);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: 'Seller application approved successfully',
      data: {
        sellerId: user._id,
        email: user.email,
        companyName: user.sellerInfo.companyName,
        tempPassword: tempPassword // Remove this in production
      }
    });

  } catch (error) {
    console.error('Approve seller application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving seller application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/admin/seller-applications/:id/reject
 * @desc    Reject seller application
 * @access  Private (Admin only)
 * @body    { reason }
 */
router.post('/seller-applications/:id/reject', [auth, adminAuth], [
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { reason } = req.body;

    // Find the seller application
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Seller application not found'
      });
    }

    // Check if application is pending
    if (user.sellerInfo?.applicationStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application is not in pending status'
      });
    }

    // Update user status to rejected
    user.sellerInfo.applicationStatus = 'rejected';
    user.sellerInfo.rejectedAt = new Date();
    user.sellerInfo.rejectedBy = req.user.userId;
    user.sellerInfo.rejectionReason = reason;

    await user.save();

    // Send rejection email
    try {
      await sendRejectionEmail(user.email, user.sellerInfo.companyName, reason);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: 'Seller application rejected successfully',
      data: {
        sellerId: user._id,
        email: user.email,
        companyName: user.sellerInfo.companyName,
        rejectionReason: reason
      }
    });

  } catch (error) {
    console.error('Reject seller application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting seller application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/dashboard', [auth, adminAuth], async (req, res) => {
  try {
    // Get application statistics
    const pendingApplications = await User.countDocuments({
      userType: 'seller',
      'sellerInfo.applicationStatus': 'pending'
    });

    const approvedApplications = await User.countDocuments({
      userType: 'seller',
      'sellerInfo.applicationStatus': 'approved'
    });

    const rejectedApplications = await User.countDocuments({
      userType: 'seller',
      'sellerInfo.applicationStatus': 'rejected'
    });

    const totalCustomers = await User.countDocuments({
      userType: 'customer'
    });

    // Get recent applications
    const recentApplications = await User.find({
      userType: 'seller',
      'sellerInfo.applicationStatus': 'pending'
    })
    .select('firstName lastName email sellerInfo.companyName sellerInfo.appliedAt')
    .sort({ 'sellerInfo.appliedAt': -1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          totalCustomers,
          totalApplications: pendingApplications + approvedApplications + rejectedApplications
        },
        recentApplications: recentApplications.map(app => ({
          id: app._id,
          companyName: app.sellerInfo.companyName,
          contactPerson: `${app.firstName} ${app.lastName}`,
          email: app.email,
          appliedAt: app.sellerInfo.appliedAt
        }))
      }
    });

  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Email service functions
const sendSellerCredentials = async (email, companyName, username, password) => {
  // Configure email transporter (use your email service)
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Seller Account Approved - Clearance Connect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF4C4C;">Congratulations! Your Seller Account is Approved</h2>
        <p>Dear ${companyName} Team,</p>
        <p>We're excited to inform you that your seller application has been approved!</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Login Credentials:</h3>
          <p><strong>Username/Email:</strong> ${username}</p>
          <p><strong>Temporary Password:</strong> ${password}</p>
        </div>
        
        <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
        
        <p>You can now:</p>
        <ul>
          <li>Access your seller dashboard</li>
          <li>Add and manage your products</li>
          <li>Track your sales and orders</li>
          <li>Manage your inventory</li>
        </ul>
        
        <p>Welcome to Clearance Connect! We look forward to a successful partnership.</p>
        
        <p>Best regards,<br>Clearance Connect Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendRejectionEmail = async (email, companyName, reason) => {
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Seller Application Update - Clearance Connect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF4C4C;">Seller Application Update</h2>
        <p>Dear ${companyName} Team,</p>
        <p>Thank you for your interest in becoming a seller on Clearance Connect.</p>
        
        <p>After careful review, we regret to inform you that we cannot approve your seller application at this time.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Reason:</h3>
          <p>${reason}</p>
        </div>
        
        <p>If you believe this decision was made in error or if you have additional information to provide, please feel free to contact our support team.</p>
        
        <p>Thank you for your understanding.</p>
        
        <p>Best regards,<br>Clearance Connect Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = router;