const express = require('express');
const {
  getProducts,
  getProductById,
  getCategories,
  getCategoryBrands,
  getAllBrands,
  getProductsByBrandTVF,
  getCategoryPath,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellers,
  getProductRecommendations
} = require('./catalog.controller');
const { verifyToken, isSellerOrAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

// Public routes for Categories & Brands
router.get('/categories', getCategories);
router.get('/categories/:id/path', getCategoryPath);
router.get('/categories/:id/brands', getCategoryBrands);
router.get('/brands', getAllBrands);
router.get('/brands/:brandId/products', getProductsByBrandTVF);

// Public product routes
router.get('/bestsellers', getBestSellers);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/recommendations', getProductRecommendations);

// Seller / Admin protected routes
router.post('/', verifyToken, isSellerOrAdmin, createProduct);
router.put('/:id', verifyToken, isSellerOrAdmin, updateProduct);
router.delete('/:id', verifyToken, isSellerOrAdmin, deleteProduct);

module.exports = router;
