const express = require('express');
const { register, login, refresh, getProfile, sendOtp, verifyOtp } = require('./auth.controller');
const { verifyToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// Shopee Multi-Step Registration Endpoints
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Standard Authentication Endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
