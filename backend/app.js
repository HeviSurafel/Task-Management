const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');



// Routes Imports
const authRoute = require('./routes/auth');
const app = express();
const PORT = process.env.PORT;
connectDB();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API's
app.use('/api', authRoute);

// Server Listen
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
