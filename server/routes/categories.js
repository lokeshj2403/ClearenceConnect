/**
 * Category Routes
 * 
 * Handles category-related operations:
 * - Get all categories
 * - Get category by ID
 * - Get products by category
 * - Create category (admin only)
 * - Update category (admin only)
 * - Delete category (admin only)
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories with optional hierarchy
 * @access  Public
 * @query   { featured?, parent? }
 */
router.get('/', async (req, res) => {
  try {
    const { featured, parent } = req.query;

    let categories;

    if (featured === 'true') {
      // Get featured categories
      categories = await Category.getFeatured();
    } else if (parent === 'null' || parent === '') {
      // Get root categories (no parent)
      categories = await Category.getRootCategories();
    } else if (parent) {
      // Get subcategories of specific parent
      categories = await Category.getSubcategories(parent);
    } else {
      // Get all active categories
      categories = await Category.find({ isActive: true })
        .sort({ sortOrder: 1, name: 1 })
        .populate('parent', 'name slug');
    }

    // Add product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category._id,
          status: 'active'
        });
        
        return {
          ...category.toObject(),
          productCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        categories: categoriesWithCount,
        total: categoriesWithCount.length
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID with hierarchy
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get category hierarchy (breadcrumb)
    const hierarchy = await category.getHierarchy();

    // Get subcategories
    const subcategories = await Category.getSubcategories(category._id);

    // Get product count
    const productCount = await Product.countDocuments({
      category: category._id,
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        category: {
          ...category.toObject(),
          productCount
        },
        hierarchy,
        subcategories
      }
    });

  } catch (error) {
    console.error('Get category error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/categories/:id/products
 * @desc    Get products by category with pagination
 * @access  Public
 * @query   { page?, limit?, sort?, order? }
 */
router.get('/:id/products', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      minPrice,
      maxPrice
    } = req.query;

    // Verify category exists
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Build query
    let query = {
      category: req.params.id,
      status: 'active'
    };

    // Price filter
    if (minPrice || maxPrice) {
      query.salePrice = {};
      if (minPrice) query.salePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.salePrice.$lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Get products
    const products = await Product.find(query)
      .populate('seller', 'firstName lastName sellerInfo.companyName sellerInfo.rating')
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug
        },
        products,
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
    console.error('Get category products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/categories
 * @desc    Create new category (admin only)
 * @access  Private (Admin)
 */
router.post('/', [auth], [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Parent must be a valid category ID')
], async (req, res) => {
  try {
    // Check if user is admin (implement admin check)
    // For now, allowing all authenticated users
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, parent, icon, color, isFeatured } = req.body;

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // If parent is specified, verify it exists and calculate level
    let level = 0;
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
      level = parentCategory.level + 1;
    }

    // Create category
    const category = new Category({
      name,
      description,
      parent: parent || null,
      level,
      icon,
      color,
      isFeatured: isFeatured || false
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category (admin only)
 * @access  Private (Admin)
 */
router.put('/:id', [auth], [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
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

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Update category
    Object.assign(category, req.body);
    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', [auth], async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({
      category: req.params.id,
      status: 'active'
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with active products'
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({
      parent: req.params.id,
      isActive: true
    });

    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with active subcategories'
      });
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;