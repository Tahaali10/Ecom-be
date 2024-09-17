require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

// Connect to the database
connectDB();

const app = express();

// Enable CORS - allow all origins since it's for a mobile app
app.use(cors({
  origin: '*', // For mobile apps, allowing all origins is generally fine
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define API routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

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


// To Use in Case of Error

// require('dotenv').config();
// const express = require('express');
// const path = require('path');
// const connectDB = require('./config/db');
// const productRoutes = require('./routes/productRoutes');
// const authRoutes = require('./routes/authRoutes');
// const cors = require('cors');

// // Connect to the database
// connectDB();

// const app = express();

// // Enable CORS with specific origin for React frontend
// app.use(cors({
//   origin: 'http://localhost:3000', 
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], 
//   credentials: true 
// }));

// // Middleware to parse JSON requests
// app.use(express.json());

// // Serve static files from the "uploads" directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Define API routes - put these before any catch-all or root routes
// app.use('/api/products', productRoutes);
// app.use('/api/auth',authRoutes);


// // Handle 404 errors
// app.use((req, res, next) => {
//   const error = new Error('Not Found');
//   error.status = 404;
//   next(error);
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).send({
//     message: err.message || 'Something went wrong!',
//     error: process.env.NODE_ENV === 'production' ? {} : err,
//   });
// });

// // Start the server
// const PORT = process.env.PORT;
// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
