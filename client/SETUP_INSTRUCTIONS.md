# 🚀 Clearance Connect - Complete Setup Instructions

## 📋 Prerequisites

Before starting, make sure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas account) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** (for version control) - [Download here](https://git-scm.com/)

## 🏗️ Project Structure

```
clearance-connect/
├── client/          # React frontend
├── server/          # Node.js backend
├── SETUP_INSTRUCTIONS.md
└── README.md
```

## ⚙️ Backend Setup (Server)

### Step 1: Navigate to Server Directory
```bash
cd server
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Choose one option)
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/clearance_connect

# Option 2: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clearance_connect

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRE=7d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Step 4: Start MongoDB (if using local installation)
```bash
# On Windows
net start MongoDB

# On macOS (if installed via Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### Step 5: Start the Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

You should see:
```
🚀 Clearance Connect Server is running!
📍 Port: 5000
🌍 Environment: development
📊 Health Check: http://localhost:5000/api/health
📚 API Base URL: http://localhost:5000/api
✅ MongoDB Connected Successfully!
```

## 🎨 Frontend Setup (Client)

### Step 1: Open New Terminal and Navigate to Client Directory
```bash
cd client
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Frontend Development Server
```bash
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🧪 Testing APIs

### Method 1: Using the Built-in Test Script
```bash
cd server
npm run test-apis
```

This will test all major API endpoints and show you the results.

### Method 2: Manual Testing with Browser
1. Open your browser and go to: `http://localhost:5000/api/health`
2. You should see: `{"success": true, "message": "Clearance Connect API is running successfully!"}`

### Method 3: Using Postman

#### Import the following endpoints into Postman:

**1. Health Check**
```
GET http://localhost:5000/api/health
```

**2. User Registration**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "userType": "customer"
}
```

**3. User Login**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**4. Get Current User (requires token)**
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**5. Get Products**
```
GET http://localhost:5000/api/products
```

**6. Get Categories**
```
GET http://localhost:5000/api/categories
```

## 👑 Admin Panel Access

### How to Access Admin Panel

1. **Open the Frontend**: Go to `http://localhost:5173`

2. **Navigate to Admin Panel**: 
   - Click on "Account" in the header
   - Click on "Admin Panel" from the dropdown menu
   - OR directly visit: `http://localhost:5173` and navigate using the header

3. **Admin Panel Features**:
   - **View Seller Applications**: See all pending, approved, and rejected applications
   - **Review Applications**: Click "View Details" to see complete application information
   - **Approve Applications**: Click the green checkmark to approve and create seller account
   - **Reject Applications**: Click the red X to reject with a reason
   - **Dashboard Statistics**: View application counts and recent activity

### Admin Panel Sections

#### 📋 **Pending Applications Tab**
- Shows all seller applications waiting for review
- Displays company name, contact person, business type, and application date
- Actions: View Details, Approve, Reject

#### ✅ **Approved Applications Tab**
- Shows all approved seller applications
- Displays approval date and admin who approved
- View-only mode for approved applications

#### ❌ **Rejected Applications Tab**
- Shows all rejected seller applications
- Displays rejection reason and date
- View rejection details and reasons

#### 📊 **Dashboard Statistics**
- Total applications by status
- Recent application activity
- Platform growth metrics

## 🏪 Seller Registration Process

### For Sellers (Business Registration)

1. **Access Registration Form**:
   - Go to the main website
   - Click "Create Account" 
   - Click "Apply for Seller Account →" link in the registration modal
   - OR click "Become a Seller" on the homepage

2. **Complete 6-Step Registration**:
   - **Step 1**: Company Information (Name, Type, GST, PAN)
   - **Step 2**: Contact & Address Details
   - **Step 3**: Business Information & Product Categories
   - **Step 4**: Banking Details
   - **Step 5**: Document Upload (GST Certificate, PAN Card, etc.)
   - **Step 6**: Review & Submit

3. **After Submission**:
   - Receive application ID
   - Application status: PENDING
   - Wait for admin review (2-3 business days)

4. **Admin Review Process**:
   - Admin reviews all details and documents
   - Admin approves or rejects with reason
   - If approved: Seller receives email with login credentials
   - If rejected: Seller receives email with rejection reason

5. **After Approval**:
   - Seller receives email with username and temporary password
   - Seller can login and access seller dashboard
   - Seller can start adding products

## 🛒 Customer Features

### Customer Registration & Shopping

1. **Customer Registration**:
   - Click "Create Account"
   - Fill in basic details (Name, Email, Password)
   - Account is created immediately (no approval needed)

2. **Shopping Features**:
   - Browse products and categories
   - Add items to cart
   - Place orders
   - Track order status

3. **My Orders Access**:
   - Login to your account
   - Click "Account" in header
   - Click "My Orders"
   - View all purchase history, order status, and details

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Backend Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
net start MongoDB  # Windows
```

**2. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill the process using port 5000
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

**3. JWT Secret Error**
```
Error: JWT_SECRET is required
```
**Solution**: Make sure your `.env` file has a JWT_SECRET value

#### Frontend Issues

**1. API Connection Error**
```
Network Error or CORS Error
```
**Solution**: 
- Make sure backend is running on port 5000
- Check CORS configuration in server/server.js

**2. Build Errors**
```
Module not found or Import errors
```
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📱 Testing the Complete Flow

### End-to-End Testing

1. **Start Both Servers**:
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend  
   cd client && npm run dev
   ```

2. **Test Customer Flow**:
   - Register as customer
   - Browse products
   - Add to cart
   - Place order
   - Check order history

3. **Test Seller Flow**:
   - Apply for seller account
   - Admin approves application
   - Seller receives credentials
   - Seller logs in and adds products

4. **Test Admin Flow**:
   - Access admin panel
   - Review seller applications
   - Approve/reject applications
   - Monitor platform statistics

## 🎯 Success Indicators

### Backend is Working When:
- ✅ Health check returns success message
- ✅ MongoDB connection established
- ✅ All API endpoints respond correctly
- ✅ File uploads work properly
- ✅ Email notifications sent successfully

### Frontend is Working When:
- ✅ Website loads at http://localhost:5173
- ✅ All pages render correctly
- ✅ Forms submit successfully
- ✅ Navigation works smoothly
- ✅ API calls complete successfully

### Complete System is Working When:
- ✅ Customer registration and login works
- ✅ Seller application submission works
- ✅ Admin can review and approve applications
- ✅ Approved sellers can login and add products
- ✅ Customers can browse and purchase products
- ✅ Order management system functions properly

## 📞 Support

If you encounter any issues:

1. **Check the console logs** in both frontend and backend terminals
2. **Verify all environment variables** are set correctly
3. **Ensure all dependencies** are installed
4. **Check database connection** and MongoDB status
5. **Test APIs individually** using the test script or Postman

For additional help, check the error messages in the console and refer to the troubleshooting section above.

---

🎉 **Congratulations!** You now have a fully functional e-commerce platform with seller registration, admin approval workflow, and customer shopping features!