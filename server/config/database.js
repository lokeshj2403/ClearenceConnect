/**
 * Database Configuration
 * 
 * This file handles the MongoDB database connection using Mongoose.
 * It includes connection options for better performance and error handling.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses connection string from environment variables
 * Includes retry logic and proper error handling
 */
const connectDB = async () => {
  try {
    // MongoDB connection options for better performance and stability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
     // bufferMaxEntries: 0, // Disable mongoose buffering
      //bufferCommands: false, // Disable mongoose buffering
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`
    ✅ MongoDB Connected Successfully!
    📍 Host: ${conn.connection.host}
    🗄️  Database: ${conn.connection.name}
    🔌 Port: ${conn.connection.port}
    `);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Retry connection after 5 seconds
    console.log('🔄 Retrying database connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;