
// server.js - Optimized for cPanel deployment
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000; // cPanel default port

// Database connection (with legacy MongoDB driver support)
connectDB();

// Middleware Configuration
app.set('trust proxy', true); // Important for cPanel proxy

// Enhanced CORS configuration
const allowedOrigins = [
  'https://makallataskmanagement.lobborecords.com',
  'http://makallataskmanagement.lobborecords.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const adminRoute=require("./routes/Admin.route")
const employeeRoute=require("./routes/Employee.route")
const commentRoute=require("./routes/comment.route")
const NotificationRoute=require("./routes/notification")
const authRoute = require('./routes/auth');
// API Routes
app.use('/api/auth', authRoute);
app.use('/api',adminRoute)
app.use('/api',employeeRoute)
app.use('/api',commentRoute)
app.use('/api',NotificationRoute)
// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    server: 'makallataskmanagement.lobborecords.com'
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});