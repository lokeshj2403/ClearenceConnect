/**
 * Clearance Connect - Main Server File
 * ------------------------------------
 * This is the entry point for the backend API.
 * 
 * It does the following:
 * 1. Loads environment variables
 * 2. Connects to the database (MongoDB)
 * 3. Configures middleware (security, performance, request parsing, logging)
 * 4. Defines API routes
 * 5. Handles errors and unknown routes
 * 6. Starts the server
 */

// ==============================
// 1. IMPORT REQUIRED MODULES
// ==============================

// Core server packages
const express = require('express'); // Web framework
const cors = require('cors'); // Cross-Origin Resource Sharing
const dotenv = require('dotenv'); // Loads variables from .env file
const helmet = require('helmet'); // Security headers
const compression = require('compression'); // Compresses response data
const rateLimit = require('express-rate-limit'); // Limits API requests
const path = require('path'); // Handles file paths

// Load environment variables early
dotenv.config();

// ==============================
// 2. DATABASE CONNECTION
// ==============================
const connectDB = require('./config/database'); // Function to connect to MongoDB
connectDB(); // Connect immediately when the server starts

// ==============================
// 3. IMPORT ROUTES
// ==============================
// Each of these files should export an Express Router
const authRoutes = require('./routes/auth'); 
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const sellerRoutes = require('./routes/sellers');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');

// ==============================
// 4. IMPORT CUSTOM MIDDLEWARE
// ==============================
const errorHandler = require('./middleware/errorHandler'); // Handles errors globally
const logger = require('./middleware/logger'); // Logs requests

// ==============================
// 5. INITIALIZE EXPRESS APP
// ==============================
const app = express(); // Create Express server instance

// ==============================
// 6. SECURITY MIDDLEWARE
// ==============================

// Helmet helps protect against well-known vulnerabilities by setting secure HTTP headers
app.use(helmet());

// Compression reduces the size of responses for faster load times
app.use(compression());

// Rate limiter helps prevent DDoS/brute force attacks by limiting requests per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Time window: 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Send rate limit info in response headers
  legacyHeaders: false,  // Disable deprecated headers
});
app.use('/api/', limiter); // Apply rate limiting only to API routes

// ==============================
// 7. CORS (Cross-Origin Resource Sharing)
// ==============================
// Allows frontend to talk to backend from a different origin (domain/port)
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-domain.com'] // Production frontend URL
    : ['http://localhost:3000', 'http://localhost:5173'], // Local dev URLs
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==============================
// 8. BODY PARSING
// ==============================
// Parse JSON request bodies (with size limit to avoid abuse)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data (for HTML forms, etc.)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==============================
// 9. CUSTOM MIDDLEWARE
// ==============================
// Logger: Prints request info (method, URL, time taken)
app.use(logger);

// ==============================
// 10. STATIC FILES
// ==============================
// Serve uploaded files so they can be accessed by URL
// Example: /uploads/image.jpg will load image.jpg from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==============================
// 11. HEALTH CHECK
// ==============================
// Useful for uptime monitoring tools like UptimeRobot
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Clearance Connect API is running successfully!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ==============================
// 12. API ROUTES
// ==============================
// Prefix each set of routes with its API path
app.use('/api/auth', authRoutes);           // Authentication (login/register)
app.use('/api/users', userRoutes);          // User management
app.use('/api/products', productRoutes);    // Products
app.use('/api/categories', categoryRoutes); // Categories
app.use('/api/orders', orderRoutes);        // Orders
app.use('/api/sellers', sellerRoutes);      // Sellers
app.use('/api/cart', cartRoutes);           // Shopping cart
app.use('/api/admin', adminRoutes);         // Admin features


// ==============================
// 13. WELCOME ROUTE
// ==============================
// Root endpoint: Shows API info
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Clearance Connect API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/api/health'
  });
});

// ==============================
// 14. 404 HANDLER
// ==============================
// If no route matches, send a JSON 404 response
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ==============================
// 15. GLOBAL ERROR HANDLER
// ==============================
// This middleware runs if any route/middleware calls next(error)
app.use(errorHandler);

// ==============================
// 16. START SERVER
// ==============================
const PORT = process.env.PORT || 5000;

// Store server instance so we can close it on fatal errors
const server = app.listen(PORT, () => {
  console.log(`
  🚀 Clearance Connect Server is running!
  📍 Port: ${PORT}
  🌍 Environment: ${process.env.NODE_ENV}
  📊 Health Check: http://localhost:${PORT}/api/health
  📚 API Base URL: http://localhost:${PORT}/api
  `);
});

// ==============================
// 17. UNHANDLED PROMISE REJECTIONS
// ==============================
// If a promise throws an error and is not caught anywhere, shut down gracefully
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1); // Exit with failure code
  });
});
