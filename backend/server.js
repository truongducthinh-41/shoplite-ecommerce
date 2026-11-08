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
const shopRoutes = require('./modules/shops/shop.routes');
const aiRoutes = require('./modules/ai/ai.routes');

const app = express();
const PORT = process.env.PORT || 3000;

const path = require('path');

// Security Middleware
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Middleware
app.use(cors());
app.use(express.json());
// Serve static frontend assets if built
const frontendDist = path.join(__dirname, '../frontend/dist');
const fs = require('fs');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', catalogRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', dashboardRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/ai', aiRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
