const express = require('express');
const { 
  createShop, 
  getMyShop, 
  getShopById, 
  getShopProducts, 
  getShopOrders 
} = require('./shop.controller');
const { verifyToken, isSellerOrAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/:id', getShopById);
router.get('/:id/products', getShopProducts);

// Seller protected routes
router.post('/', verifyToken, createShop);
router.get('/my/profile', verifyToken, isSellerOrAdmin, getMyShop);
router.get('/my/orders', verifyToken, isSellerOrAdmin, getShopOrders);

module.exports = router;

