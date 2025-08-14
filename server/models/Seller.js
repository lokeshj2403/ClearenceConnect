/**
 * Seller Routes
 * -------------
 * Handles:
 * - Seller registration (with file uploads)
 * - Seller profile management
 * - Admin approval/rejection
 */

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");

const auth = require("../middleware/auth"); // For logged-in users
const sellerAuth = require("../middleware/sellerAuth"); // For sellers only
const Seller = require("../models/Seller"); // Seller model
const User = require("../models/User"); // User model (link seller to user)

// ======================
// Multer Setup (File Uploads)
// ======================

// Define storage location and naming
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/seller_docs/"); // Folder to store uploads
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = allowedTypes.test(file.mimetype);

  if (mimeType && allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, and PNG files are allowed"));
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: fileFilter,
});

// ======================
// @route   POST /api/sellers/register
// @desc    Apply to become a seller
// @access  Private
// ======================
router.post(
  "/register",
  auth,
  // Handle multiple file uploads
  upload.fields([
    { name: "gstCertificate", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "companyRegistration", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "productCatalog", maxCount: 1 },
  ]),
  // Validate text fields
  [
    body("companyName").notEmpty().withMessage("Company name is required"),
    body("companyType").notEmpty().withMessage("Company type is required"),
    body("registrationNumber").notEmpty().withMessage("Registration number is required"),
    body("gstNumber").notEmpty().withMessage("GST number is required"),
    body("panNumber").notEmpty().withMessage("PAN number is required"),
    body("establishedYear").notEmpty().withMessage("Established year is required"),
    body("contactPerson").notEmpty().withMessage("Contact person name is required"),
    body("designation").notEmpty().withMessage("Designation is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("pincode").notEmpty().withMessage("Pincode is required"),
    body("businessCategory").notEmpty().withMessage("Business category is required"),
    body("bankName").notEmpty().withMessage("Bank name is required"),
    body("accountNumber").notEmpty().withMessage("Account number is required"),
    body("ifscCode").notEmpty().withMessage("IFSC code is required"),
    body("accountHolderName").notEmpty().withMessage("Account holder name is required"),
  ],
  async (req, res) => {
    try {
      // Check validation errors for text fields
      const errors = validationResult(req);
      let errorMessages = [];

      if (!errors.isEmpty()) {
        errorMessages = errors.array().map((err) => err.msg);
      }

      // Check required file uploads
      const requiredFiles = ["gstCertificate", "panCard", "companyRegistration", "bankStatement"];
      requiredFiles.forEach((fileKey) => {
        if (!req.files[fileKey]) {
          errorMessages.push(`${fileKey} is required`);
        }
      });

      if (errorMessages.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errorMessages,
        });
      }

      // Prevent duplicate registration
      const existingSeller = await Seller.findOne({ user: req.user.userId });
      if (existingSeller) {
        return res.status(400).json({
          success: false,
          message: "You have already applied for seller registration",
        });
      }

      // Create new seller entry
      const newSeller = new Seller({
        user: req.user.userId,
        companyName: req.body.companyName,
        companyType: req.body.companyType,
        registrationNumber: req.body.registrationNumber,
        gstNumber: req.body.gstNumber,
        panNumber: req.body.panNumber,
        establishedYear: req.body.establishedYear,
        contactPerson: req.body.contactPerson,
        designation: req.body.designation,
        email: req.body.email,
        phone: req.body.phone,
        alternatePhone: req.body.alternatePhone || "",
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        country: req.body.country || "India",
        businessCategory: req.body.businessCategory,
        productCategories: req.body.productCategories || [],
        manufacturingCapacity: req.body.manufacturingCapacity || "",
        warehouseLocation: req.body.warehouseLocation || "",
        bankName: req.body.bankName,
        accountNumber: req.body.accountNumber,
        ifscCode: req.body.ifscCode,
        accountHolderName: req.body.accountHolderName,
        documents: {
          gstCertificate: req.files.gstCertificate[0].path,
          panCard: req.files.panCard[0].path,
          companyRegistration: req.files.companyRegistration[0].path,
          bankStatement: req.files.bankStatement[0].path,
          productCatalog: req.files.productCatalog
            ? req.files.productCatalog[0].path
            : "",
        },
        isVerified: false,
      });

      await newSeller.save();

      res.status(201).json({
        success: true,
        message: "Seller application submitted successfully. Please wait for admin approval.",
        data: newSeller,
      });
    } catch (error) {
      console.error("Seller registration error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while registering seller",
        error: error.message,
      });
    }
  }
);

// ======================
// @route   GET /api/sellers/me
// @desc    Get current seller profile
// @access  Private (seller only)
// ======================
router.get("/me", auth, sellerAuth, async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.userId }).populate("user", "-password");
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller profile not found" });
    }
    res.json({ success: true, data: seller });
  } catch (error) {
    console.error("Get seller profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ======================
// @route   PATCH /api/sellers/:id/verify
// @desc    Approve/Reject seller (admin only)
// @access  Private (admin)
// ======================
router.patch("/:id/verify", auth, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.userType !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can verify sellers" });
    }

    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    seller.isVerified = Boolean(req.body.isVerified);
    await seller.save();

    res.json({
      success: true,
      message: `Seller ${seller.isVerified ? "approved" : "rejected"} successfully`,
      data: seller,
    });
  } catch (error) {
    console.error("Verify seller error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
