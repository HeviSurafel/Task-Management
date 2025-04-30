const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

// Routes Imports
const authRoute = require('./routes/auth');
const app = express();
const PORT = process.env.PORT;
app.use(cookieParser());
const path = require('path');
// CORS Configuration
app.use(cors({
    origin: "http://localhost:3000", // Allow only your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // Allow cookies and authentication headers
}));

connectDB();
// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
const adminRoute=require("./routes/Admin.route")
// API's
app.use('/api/auth', authRoute);
app.use('/api',adminRoute)

// Server Listen
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
