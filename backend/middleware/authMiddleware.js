const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided.' });

  const tokenParts = token.split(' ');
  const jwtToken = tokenParts.length === 2 ? tokenParts[1] : token;

  jwt.verify(jwtToken, process.env.JWT_SECRET || 'supersecretkey', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized!' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Require Admin Role!' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
