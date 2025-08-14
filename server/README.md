# Clearance Connect Backend Server

A comprehensive Node.js/Express.js backend server for the Clearance Connect e-commerce platform where companies can sell their overstocked and clearance items.

## 🚀 Features

### Core Functionality
- **User Authentication** - JWT-based auth with email/password
- **User Management** - Customer and seller profiles
- **Product Management** - CRUD operations for products
- **Category Management** - Hierarchical product categories
- **Shopping Cart** - In-memory cart with validation
- **Order Management** - Complete order lifecycle
- **Seller Dashboard** - Analytics and management tools
- **File Upload** - Images and documents handling

### Security Features
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Rate Limiting** - Prevents API abuse
- **CORS Protection** - Cross-origin request handling
- **Helmet Security** - HTTP headers security
- **Input Validation** - express-validator for data validation

### Database Features
- **MongoDB Integration** - Mongoose ODM
- **Data Relationships** - Proper schema relationships
- **Indexing** - Optimized database queries
- **Aggregation** - Complex data analytics

## 📁 Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── sellerAuth.js        # Seller-specific auth
│   ├── upload.js            # File upload handling
│   ├── errorHandler.js      # Global error handling
│   └── logger.js            # Request logging
├── models/
│   ├── User.js              # User schema (customers & sellers)
│   ├── Product.js           # Product schema
│   ├── Category.js          # Category schema
│   └── Order.js             # Order schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management
│   ├── products.js          # Product operations
│   ├── categories.js        # Category management
│   ├── orders.js            # Order processing
│   ├── sellers.js           # Seller operations
│   └── cart.js              # Shopping cart
├── uploads/                 # File upload directory
├── .env                     # Environment variables
├── .env.example             # Environment template
├── package.json             # Dependencies
└── server.js                # Main server file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/clearance_connect
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   MAX_FILE_SIZE=5242880
   ```

3. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas (cloud)

4. **Run the Server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify Installation**
   - Visit: `http://localhost:5000/api/health`
   - Should return: `{"success": true, "message": "Clearance Connect API is running successfully!"}`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "userType": "customer"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <jwt_token>
```

### Product Endpoints

#### Get All Products
```http
GET /products?page=1&limit=20&category=<category_id>&search=<query>
```

#### Get Single Product
```http
GET /products/<product_id>
```

#### Create Product (Seller Only)
```http
POST /products
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

{
  "name": "Product Name",
  "description": "Product description",
  "originalPrice": 100,
  "salePrice": 80,
  "category": "<category_id>",
  "stock.quantity": 50,
  "clearanceReason": "overstock",
  "images": [<file1>, <file2>]
}
```

### Category Endpoints

#### Get All Categories
```http
GET /categories
```

#### Get Category Products
```http
GET /categories/<category_id>/products
```

### Cart Endpoints

#### Get Cart
```http
GET /cart
Authorization: Bearer <jwt_token>
```

#### Add to Cart
```http
POST /cart/add
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "productId": "<product_id>",
  "quantity": 2
}
```

### Order Endpoints

#### Create Order
```http
POST /orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "items": [
    {
      "product": "<product_id>",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "payment": {
    "method": "cod"
  }
}
```

### Seller Endpoints

#### Register as Seller
```http
POST /sellers/register
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

{
  "companyName": "ABC Company",
  "companyType": "Private Limited Company",
  "gstNumber": "27ABCDE1234F1Z5",
  "panNumber": "ABCDE1234F",
  "phone": "9876543210",
  "businessCategory": "Manufacturer",
  "productCategories": ["Electronics", "Fashion"],
  "bankName": "State Bank of India",
  "accountNumber": "1234567890",
  "ifscCode": "SBIN0001234",
  "gstCertificate": <file>,
  "panCard": <file>
}
```

#### Get Seller Dashboard
```http
GET /sellers/dashboard
Authorization: Bearer <jwt_token>
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/clearance_connect |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `MAX_FILE_SIZE` | Maximum file upload size | 5242880 (5MB) |

### Database Configuration

The server uses MongoDB with Mongoose ODM. Key features:
- **Connection pooling** for better performance
- **Automatic reconnection** on connection loss
- **Proper indexing** for optimized queries
- **Data validation** at schema level

### File Upload Configuration

- **Storage**: Local filesystem (`/uploads` directory)
- **Supported formats**: JPEG, PNG, WebP, PDF
- **Size limit**: 5MB per file
- **Organization**: Files organized in subdirectories by type

## 🚦 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 20
    }
  }
}
```

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "user_id",
  "userType": "customer|seller|admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Authorization Levels
1. **Public** - No authentication required
2. **Authenticated** - Valid JWT token required
3. **Seller** - Seller account required
4. **Admin** - Admin privileges required (future)

### Token Usage
Include JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📊 Database Schema

### User Schema
- Basic information (name, email, password)
- User type (customer, seller, admin)
- Address and contact details
- Seller-specific information
- Authentication fields

### Product Schema
- Product details and specifications
- Pricing and discount information
- Inventory management
- Images and media
- SEO and search fields
- Analytics data

### Order Schema
- Order items and quantities
- Customer and shipping information
- Payment details
- Order status and timeline
- Tracking information

### Category Schema
- Hierarchical structure
- SEO-friendly URLs
- Display configuration
- Product count tracking

## 🛡️ Security Features

### Input Validation
- **express-validator** for request validation
- **Mongoose validation** at database level
- **File type validation** for uploads
- **Size limits** for requests and files

### Security Headers
- **Helmet.js** for HTTP security headers
- **CORS** configuration for cross-origin requests
- **Rate limiting** to prevent abuse
- **Compression** for better performance

### Password Security
- **bcrypt** hashing with salt rounds
- **Password strength** validation
- **Account lockout** after failed attempts
- **Password reset** functionality

## 📈 Performance Optimization

### Database Optimization
- **Proper indexing** on frequently queried fields
- **Aggregation pipelines** for complex queries
- **Connection pooling** for better performance
- **Lean queries** where appropriate

### Caching Strategy
- **In-memory cart storage** for better performance
- **Static file serving** for uploads
- **Compression middleware** for responses

### File Handling
- **Organized directory structure** for uploads
- **File size limits** to prevent abuse
- **Cleanup utilities** for error handling

## 🐛 Error Handling

### Global Error Handler
- **Consistent error responses** across all endpoints
- **Detailed logging** for debugging
- **Environment-specific** error details
- **Proper HTTP status codes**

### Common Error Types
- **Validation errors** (400)
- **Authentication errors** (401)
- **Authorization errors** (403)
- **Not found errors** (404)
- **Server errors** (500)

## 📝 Logging

### Request Logging
- **HTTP method and URL**
- **Request timestamp**
- **Client IP address**
- **User agent information**
- **Request/response body** (development only)

### Error Logging
- **Error message and stack trace**
- **Request context**
- **User information** (if available)
- **Timestamp and environment**

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret
- [ ] Configure MongoDB Atlas
- [ ] Set up SSL/HTTPS
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/clearance_connect
JWT_SECRET=super_secure_production_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@clearanceconnect.com
- Documentation: [API Docs](http://localhost:5000/api/docs)
- Health Check: [Server Status](http://localhost:5000/api/health)

---

**Clearance Connect Backend** - Empowering businesses to turn excess inventory into opportunity! 🚀