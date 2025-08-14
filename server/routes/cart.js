/**
 * Cart Routes
 * 
 * Handles shopping cart operations:
 * - Get cart items
 * - Add item to cart
 * - Update item quantity
 * - Remove item from cart
 * - Clear cart
 * - Apply coupon/discount
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// In-memory cart storage (in production, use Redis or database)
// Format: { userId: { items: [{ productId, quantity, addedAt }], updatedAt } }
const cartStorage = new Map();

/**
 * @route   GET /api/cart
 * @desc    Get user's cart items
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userCart = cartStorage.get(userId) || { items: [], updatedAt: new Date() };

    // Get product details for cart items
    const cartItems = [];
    let subtotal = 0;

    for (const cartItem of userCart.items) {
      const product = await Product.findById(cartItem.productId)
        .populate('seller', 'firstName lastName sellerInfo.companyName')
        .select('name images salePrice originalPrice discountPercentage stock status');

      if (product && product.status === 'active') {
        const itemTotal = product.salePrice * cartItem.quantity;
        subtotal += itemTotal;

        cartItems.push({
          id: product._id,
          name: product.name,
          image: product.images[0]?.url,
          price: product.salePrice,
          originalPrice: product.originalPrice,
          discountPercentage: product.discountPercentage,
          quantity: cartItem.quantity,
          total: itemTotal,
          stock: product.stock.available,
          seller: product.seller,
          addedAt: cartItem.addedAt
        });
      }
    }

    // Calculate totals
    const shippingCost = subtotal >= 500 ? 0 : 50; // Free shipping above ₹500
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shippingCost + tax;

    res.json({
      success: true,
      data: {
        items: cartItems,
        summary: {
          itemCount: cartItems.length,
          totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal,
          shippingCost,
          tax,
          total,
          freeShippingThreshold: 500,
          freeShippingEligible: subtotal >= 500
        },
        updatedAt: userCart.updatedAt
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/add', auth, [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10')
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

    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    // Verify product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    if (product.stock.available < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock.available} items available in stock`
      });
    }

    // Get or create user cart
    let userCart = cartStorage.get(userId) || { items: [], updatedAt: new Date() };

    // Check if item already exists in cart
    const existingItemIndex = userCart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const newQuantity = userCart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock.available) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more items. Only ${product.stock.available - userCart.items[existingItemIndex].quantity} more available`
        });
      }

      if (newQuantity > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 items allowed per product'
        });
      }

      userCart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      userCart.items.push({
        productId,
        quantity,
        addedAt: new Date()
      });
    }

    userCart.updatedAt = new Date();
    cartStorage.set(userId, userCart);

    // Update product analytics
    await product.incrementCartAdds();

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        itemCount: userCart.items.length,
        totalQuantity: userCart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/cart/update
 * @desc    Update item quantity in cart
 * @access  Private
 */
router.put('/update', auth, [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .isInt({ min: 0, max: 10 })
    .withMessage('Quantity must be between 0 and 10')
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

    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    // Get user cart
    let userCart = cartStorage.get(userId);
    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Find item in cart
    const itemIndex = userCart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // If quantity is 0, remove item
    if (quantity === 0) {
      userCart.items.splice(itemIndex, 1);
    } else {
      // Verify stock availability
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (product.stock.available < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock.available} items available in stock`
        });
      }

      // Update quantity
      userCart.items[itemIndex].quantity = quantity;
    }

    userCart.updatedAt = new Date();
    cartStorage.set(userId, userCart);

    res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated successfully',
      data: {
        itemCount: userCart.items.length,
        totalQuantity: userCart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/cart/remove/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    // Get user cart
    let userCart = cartStorage.get(userId);
    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Find and remove item
    const initialLength = userCart.items.length;
    userCart.items = userCart.items.filter(
      item => item.productId.toString() !== productId
    );

    if (userCart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    userCart.updatedAt = new Date();
    cartStorage.set(userId, userCart);

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        itemCount: userCart.items.length,
        totalQuantity: userCart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete('/clear', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Clear user cart
    cartStorage.set(userId, { items: [], updatedAt: new Date() });

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        itemCount: 0,
        totalQuantity: 0
      }
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/cart/validate
 * @desc    Validate cart items before checkout
 * @access  Private
 */
router.post('/validate', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userCart = cartStorage.get(userId);

    if (!userCart || userCart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const validationErrors = [];
    const validItems = [];

    for (const cartItem of userCart.items) {
      const product = await Product.findById(cartItem.productId);

      if (!product) {
        validationErrors.push({
          productId: cartItem.productId,
          error: 'Product not found'
        });
        continue;
      }

      if (product.status !== 'active') {
        validationErrors.push({
          productId: cartItem.productId,
          productName: product.name,
          error: 'Product is no longer available'
        });
        continue;
      }

      if (product.stock.available < cartItem.quantity) {
        validationErrors.push({
          productId: cartItem.productId,
          productName: product.name,
          error: `Only ${product.stock.available} items available, but ${cartItem.quantity} requested`
        });
        continue;
      }

      validItems.push({
        productId: cartItem.productId,
        productName: product.name,
        quantity: cartItem.quantity,
        price: product.salePrice,
        available: true
      });
    }

    res.json({
      success: validationErrors.length === 0,
      message: validationErrors.length === 0 
        ? 'Cart validation successful' 
        : 'Cart validation failed',
      data: {
        validItems,
        errors: validationErrors,
        canProceedToCheckout: validationErrors.length === 0
      }
    });

  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while validating cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;