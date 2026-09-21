const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./modules/auth/auth.routes');
const catalogRoutes = require('./modules/catalog/catalog.routes');
const orderRoutes = require('./modules/order/order.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const reviewsRoutes = require('./modules/reviews/reviews.routes');

const app = express();
const PORT = process.env.PORT || 3000;

const path = require('path');

// Security Middleware
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); // Serve frontend files

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', catalogRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', dashboardRoutes);
app.use('/api/reviews', reviewsRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
