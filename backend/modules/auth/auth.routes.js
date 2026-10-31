const express = require('express');
const { register, login, refresh, getProfile } = require('./auth.controller');
const { verifyToken } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
