/**
 * File Upload Middleware
 * 
 * Handles file uploads using multer
 * Supports image uploads for products, user avatars, and seller documents
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectories based on file type
    let subDir = 'general';
    
    if (file.fieldname === 'avatar') {
      subDir = 'avatars';
    } else if (file.fieldname === 'images' || file.fieldname.includes('image')) {
      subDir = 'products';
    } else if (['gstCertificate', 'panCard', 'companyRegistration', 'bankStatement', 'productCatalog'].includes(file.fieldname)) {
      subDir = 'documents';
    }
    
    const fullPath = path.join(uploadDir, subDir);
    
    // Create subdirectory if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    // Clean filename
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${cleanBaseName}_${uniqueSuffix}${extension}`;
    
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types based on field name
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedDocumentTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  
  if (file.fieldname === 'avatar' || file.fieldname === 'images' || file.fieldname.includes('image')) {
    // Image files
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, and WebP images are allowed'), false);
    }
  } else if (['gstCertificate', 'panCard', 'companyRegistration', 'bankStatement', 'productCatalog'].includes(file.fieldname)) {
    // Document files
    if (allowedDocumentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed for documents'), false);
    }
  } else {
    // Default: allow images and PDFs
    if ([...allowedImageTypes, ...allowedDocumentTypes].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Maximum 10 files per request
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size allowed is 5MB.'
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed per request.'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please check the field names.'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${error.message}`
      });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
  
  next();
};

// Utility function to delete uploaded files (for cleanup on error)
const deleteUploadedFiles = (files) => {
  if (!files) return;
  
  const filesToDelete = Array.isArray(files) ? files : Object.values(files).flat();
  
  filesToDelete.forEach(file => {
    if (file && file.path) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error('Error deleting file:', file.path, err);
        }
      });
    }
  });
};

// Export configured upload middleware with error handling
module.exports = upload;
module.exports.handleUploadError = handleUploadError;
module.exports.deleteUploadedFiles = deleteUploadedFiles;