/**
 * Product Routes
 * 
 * Handles all product-related operations:
 * - Get all products with filtering and pagination
 * - Get single product details
 * - Create new product (sellers only)
 * - Update product (sellers only)
 * - Delete product (sellers only)
 * - Search products
 * - Get featured products
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const sellerAuth = require('../middleware/sellerAuth');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, sorting, and pagination
 * @access  Public
 * @query   { category?, minPrice?, maxPrice?, search?, sort?, page?, limit? }
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be non-negative')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
      featured,
      seller
    } = req.query;

    // Build query object
    let query = { status: 'active' };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.salePrice = {};
      if (minPrice) query.salePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.salePrice.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Seller filter
    if (seller) {
      query.seller = seller;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Execute query with population
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('seller', 'firstName lastName sellerInfo.companyName sellerInfo.rating')
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip)
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 * @query   { limit? }
 */
router.get('/featured', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const limit = parseInt(req.query.limit) || 10;

    const products = await Product.findFeatured(limit);

    res.json({
      success: true,
      data: { products }
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/products/search
 * @desc    Search products with advanced filtering
 * @access  Public
 * @query   { q, category?, minPrice?, maxPrice?, sort?, page?, limit? }
 */
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        errors: errors.array()
      });
    }

    const {
      q: query,
      category,
      minPrice,
      maxPrice,
      sort = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    const options = {
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy: sort === 'relevance' ? 'score' : sort,
      sortOrder: sort === 'relevance' ? { $meta: 'textScore' } : -1,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const products = await Product.searchProducts(query, options);

    // Get total count for the same search
    const totalQuery = {
      status: 'active',
      $text: { $search: query }
    };
    if (category) totalQuery.category = category;
    if (minPrice) totalQuery.salePrice = { $gte: minPrice };
    if (maxPrice) totalQuery.salePrice = { ...totalQuery.salePrice, $lte: maxPrice };

    const total = await Product.countDocuments(totalQuery);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        searchQuery: query,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('seller', 'firstName lastName sellerInfo.companyName sellerInfo.rating sellerInfo.totalSales');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await product.incrementViews();

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product (sellers only)
 * @access  Private (Seller)
 */
router.post('/', [auth, sellerAuth, upload.array('images', 5)], [
  body('name').trim().isLength({ min: 3, max: 200 }).withMessage('Product name must be between 3 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('originalPrice').isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('salePrice').isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('clearanceReason').isIn(['overstock', 'seasonal', 'discontinued', 'damaged_packaging', 'return', 'other']).withMessage('Invalid clearance reason')
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

    // Process uploaded images
    const images = req.files ? req.files.map((file, index) => ({
      url: `/uploads/${file.filename}`,
      alt: req.body.name,
      isPrimary: index === 0
    })) : [];

    // Create product
    const productData = {
      name: req.body.name,
      description: req.body.description,
      originalPrice: parseFloat(req.body.originalPrice),
      salePrice: parseFloat(req.body.salePrice),
      category: req.body.category,
      clearanceReason: req.body.clearanceReason,
      condition: req.body.condition || 'new',
      seller: req.user.userId,
      images,
      stock: {
        quantity: parseInt(req.body.stock),
        reserved: 0
      },
      status: 'active'
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/products (Original implementation)
 * @desc    Create a new product (sellers only) - Enhanced version
 * @access  Private (Seller)
 */
router.post('/enhanced', [auth, sellerAuth, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 }
])], [
  body('name').trim().isLength({ min: 3, max: 200 }).withMessage('Product name must be between 3 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('originalPrice').isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('salePrice').isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('clearanceReason').isIn(['overstock', 'seasonal', 'discontinued', 'damaged_packaging', 'return', 'other']).withMessage('Invalid clearance reason')
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

    // Process uploaded images
    const images = req.files?.images ? req.files.images.map((file, index) => ({
      url: `/uploads/${file.filename}`,
      alt: req.body.name,
      isPrimary: index === 0
    })) : [];

    // Process uploaded video
    const video = req.files?.video ? {
      url: `/uploads/${req.files.video[0].filename}`,
      type: req.files.video[0].mimetype
    } : null;

    // Create product
    const productData = {
      name: req.body.name,
      description: req.body.description,
      originalPrice: parseFloat(req.body.originalPrice),
      salePrice: parseFloat(req.body.salePrice),
      category: req.body.category,
      clearanceReason: req.body.clearanceReason,
      condition: req.body.condition || 'new',
      seller: req.user.userId,
      images,
      video,
      stock: {
        quantity: parseInt(req.body.stock),
        reserved: 0
      },
      status: 'active'
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update product (seller only - own products)
 * @access  Private (Seller)
 */
router.put('/:id', [auth, sellerAuth], [
  body('name').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Product name must be between 3 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('salePrice').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number')
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

    // Find product and verify ownership
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.userId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to update it'
      });
    }

    // Update product
    Object.assign(product, req.body);
    await product.save();

    // Populate the response
    await product.populate('category', 'name slug');
    await product.populate('seller', 'firstName lastName sellerInfo.companyName');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (seller only - own products)
 * @access  Private (Seller)
 */
router.delete('/:id', [auth, sellerAuth], async (req, res) => {
  try {
    // Find product and verify ownership
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.userId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to delete it'
      });
    }

    // Soft delete by changing status
    product.status = 'inactive';
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;