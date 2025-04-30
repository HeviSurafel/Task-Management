// server.js - Optimized for cPanel deployment
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Trust proxy (important for reverse proxies on cPanel)
app.set('trust proxy', true);

// Enhanced CORS configuration
const allowedOrigins = [
  'https://makallataskmanagement.lobborecords.com',
  'http://localhost:3000',
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// ===== API ROUTES =====
const adminRoute = require("./routes/Admin.route");
const employeeRoute = require("./routes/Employee.route");
const commentRoute = require("./routes/comment.route");
const NotificationRoute = require("./routes/notification");
const authRoute = require('./routes/auth');

// Mount API Routes
app.use('/api/auth', authRoute);
app.use('/api', adminRoute);
app.use('/api', employeeRoute);
app.use('/api', commentRoute);
app.use('/api', NotificationRoute);

// Serve static files (uploads and frontend build)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});
// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    server: 'makallataskmanagement.lobborecords.com'
  });
});

// 

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
