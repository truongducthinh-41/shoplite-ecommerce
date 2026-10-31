const pool = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. Đăng ký tài khoản (Hỗ trợ role 'customer' và 'seller')
const register = async (req, res) => {
  const { name, email, password, role = 'customer', phone, shop_name } = req.body;
  
  // Validate role
  const allowedRoles = ['customer', 'seller'];
  const assignedRole = allowedRoles.includes(role) ? role : 'customer';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Tạo User
    const userResult = await client.query(
      'INSERT INTO Users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role',
      [name, email, password_hash, phone || null, assignedRole]
    );
    const newUser = userResult.rows[0];

    // Nếu đăng ký làm Người bán hàng (Seller), tự động khởi tạo Shop cơ bản
    let newShop = null;
    if (assignedRole === 'seller') {
      const finalShopName = shop_name || `${name}'s Official Shop`;
      const shopSlug = finalShopName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
      
      const shopResult = await client.query(
        'INSERT INTO Shops (owner_id, name, slug, description, is_official) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, slug, rating, is_official',
        [newUser.id, finalShopName, shopSlug, `Gian hàng thương mại điện tử của ${name}`, false]
      );
      newShop = shopResult.rows[0];
    }

    await client.query('COMMIT');

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: { ...newUser, shop: newShop } 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Auth Register Error]:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Database error during registration' });
  } finally {
    client.release();
  }
};

// 2. Đăng nhập tài khoản
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Kiểm tra xem user có phải là Seller và sở hữu Shop nào không
    let shopInfo = null;
    if (user.role === 'seller' || user.role === 'admin') {
      const shopResult = await pool.query('SELECT id, name, slug, rating, is_official, logo_url FROM Shops WHERE owner_id = $1', [user.id]);
      if (shopResult.rows.length > 0) {
        shopInfo = shopResult.rows[0];
      }
    }

    const accessToken = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        shopId: shopInfo ? shopInfo.id : null 
      },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey',
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Login successful', 
      token: accessToken, 
      refreshToken, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
        shop: shopInfo
      } 
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 3. Lấy thông tin cá nhân hiện tại
const getProfile = async (req, res) => {
  try {
    const userResult = await pool.query('SELECT id, name, email, phone, avatar_url, role, created_at FROM Users WHERE id = $1', [req.userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = userResult.rows[0];
    let shopInfo = null;
    if (user.role === 'seller' || user.role === 'admin') {
      const shopResult = await pool.query('SELECT id, name, slug, description, rating, is_official, logo_url, banner_url FROM Shops WHERE owner_id = $1', [user.id]);
      if (shopResult.rows.length > 0) {
        shopInfo = shopResult.rows[0];
      }
    }

    res.json({ ...user, shop: shopInfo });
  } catch (error) {
    console.error('[Auth Profile Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// 4. Refresh Token
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey', async (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid refresh token' });

    try {
      const result = await pool.query('SELECT id, role FROM Users WHERE id = $1', [decoded.id]);
      const user = result.rows[0];
      if (!user) return res.status(404).json({ error: 'User not found' });

      let shopId = null;
      if (user.role === 'seller' || user.role === 'admin') {
        const shopRes = await pool.query('SELECT id FROM Shops WHERE owner_id = $1', [user.id]);
        if (shopRes.rows.length > 0) shopId = shopRes.rows[0].id;
      }

      const newAccessToken = jwt.sign(
        { id: user.id, role: user.role, shopId },
        process.env.JWT_SECRET || 'supersecretkey',
        { expiresIn: '1d' }
      );

      res.json({ token: newAccessToken });
    } catch (dbError) {
      res.status(500).json({ error: 'Database error' });
    }
  });
};

module.exports = { register, login, getProfile, refresh };
