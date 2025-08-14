/**
 * Seller Routes
 * -------------
 * Handles:
 * - Seller application with full validation
 * - File uploads
 * - Seller profile management
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

const auth = require('../middleware/auth');
const Seller = require('../models/Seller'); // New Seller model

/**
 * ========================================
 * Multer Setup for File Uploads
 * ========================================
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/sellers'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Only PDF, JPG, and PNG files are allowed'));
    }
    cb(null, true);
  }
});

/**
 * ========================================
 * @route   POST /api/sellers/register
 * @desc    Apply to become a seller
 * @access  Private
 * ========================================
 */
router.post(
  '/register',
  auth,
  upload.fields([
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'companyRegistration', maxCount: 1 },
    { name: 'bankStatement', maxCount: 1 },
    { name: 'productCatalog', maxCount: 1 }
  ]),
  [
    // Backend Validations
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('companyType').notEmpty().withMessage('Company type is required'),
    body('registrationNumber').notEmpty().withMessage('Registration number is required'),
    body('gstNumber').matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).withMessage('Invalid GST number'),
    body('panNumber').matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Invalid PAN number'),
    body('establishedYear').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid year'),
    body('contactPerson').notEmpty().withMessage('Contact person is required'),
    body('designation').notEmpty().withMessage('Designation is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').matches(/^[6-9][0-9]{9}$/).withMessage('Valid phone number is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('pincode').matches(/^[1-9][0-9]{5}$/).withMessage('Valid PIN code is required'),
    body('businessCategory').notEmpty().withMessage('Business category is required'),
    body('productCategories').isArray({ min: 1 }).withMessage('At least one product category is required'),
    body('bankName').notEmpty().withMessage('Bank name is required'),
    body('accountNumber').notEmpty().withMessage('Account number is required'),
    body('ifscCode').matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC code'),
    body('accountHolderName').notEmpty().withMessage('Account holder name is required')
  ],
  async (req, res) => {
    try {
      // Validation error handling
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Create seller entry
      const sellerData = {
        user: req.user.userId,
        ...req.body,
        documents: {
          gstCertificate: req.files?.gstCertificate?.[0]?.path || null,
          panCard: req.files?.panCard?.[0]?.path || null,
          companyRegistration: req.files?.companyRegistration?.[0]?.path || null,
          bankStatement: req.files?.bankStatement?.[0]?.path || null,
          productCatalog: req.files?.productCatalog?.[0]?.path || null
        },
        isVerified: false,
        rating: 0
      };

      const seller = new Seller(sellerData);
      await seller.save();

      res.status(201).json({
        success: true,
        message: 'Seller application submitted successfully',
        data: { sellerId: seller._id }
      });
    } catch (error) {
      console.error('Seller registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during seller registration'
      });
    }
  }
);

module.exports = router;
