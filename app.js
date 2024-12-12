require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

connectDB();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());
app.get('/', (req,res)=>{
    res.send('Server is running')
});
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    if (res.headersSent) {
        return next(err);
    }
    res.status(err.status || 500).send({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
