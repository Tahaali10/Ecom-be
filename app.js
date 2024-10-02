require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

// Connect to the database
connectDB();

const app = express();

const uploadsDir = path.resolve('/tmp', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created upload directory at ${uploadsDir}`);
}

// Enable CORS - allow all origins since it's for a mobile app
app.use(cors({
    origin: '*', // For mobile apps, allowing all origins is generally fine
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the "uploads" directory, allowing cross-origin requests
app.use('/uploads', cors(), express.static(uploadsDir));

// Define API routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// List uploaded files (for debugging)
app.get('/list-uploads', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to list uploads');
        }
        res.json({ files });
    });
});

// Handle 404 errors
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err,
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
