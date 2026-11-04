const pool = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Lưu trữ OTP tạm thời trong bộ nhớ (phone -> { otp, expiresAt })
const otpStore = new Map();

// 1. Gửi mã OTP xác minh số điện thoại
const sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.trim().length < 8) {
    return res.status(400).json({ error: 'Số điện thoại không hợp lệ (cần ít nhất 8 chữ số).' });
  }

  // Chuẩn hóa số điện thoại: bỏ ký tự không phải số
  const cleanPhone = phone.replace(/\D/g, '');

  try {
    // Kiểm tra số điện thoại đã tồn tại trong hệ thống chưa
    const existing = await pool.query('SELECT id FROM Users WHERE phone = $1', [cleanPhone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Số điện thoại này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc sử dụng số khác.' 
      });
    }

    // Tạo mã OTP 6 số (mặc định demo: 123456 để dễ dàng báo cáo đồ án và kiểm thử)
    const otp = '123456';
    const expiresAt = Date.now() + 5 * 60 * 1000; // Có hiệu lực trong 5 phút
    otpStore.set(cleanPhone, { otp, expiresAt });

    res.json({
      success: true,
      message: 'Mã xác thực OTP đã được gửi đến số điện thoại của bạn!',
      otp, // Trả về mã OTP trong phản hồi để phục vụ kiểm thử / demo đồ án
      phone: cleanPhone
    });
  } catch (error) {
    console.error('[sendOtp Error]:', error);
    res.status(500).json({ error: 'Lỗi server khi gửi mã xác thực' });
  }
};

// 2. Xác thực mã OTP
const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ số điện thoại và mã OTP.' });
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const record = otpStore.get(cleanPhone);

  // Chấp nhận mã master test '123456' hoặc mã lưu trong bộ nhớ còn hạn
  if (otp === '123456' || (record && record.otp === otp && record.expiresAt > Date.now())) {
    return res.json({ 
      success: true, 
      message: 'Xác thực số điện thoại thành công!',
      phone: cleanPhone
    });
  }

  return res.status(400).json({ error: 'Mã OTP không chính xác hoặc đã hết hạn (Mã demo: 123456).' });
};

// 3. Đăng ký tài khoản (Tạo tài khoản người dùng chuẩn)
const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  if (!name || !password) {
    return res.status(400).json({ error: 'Vui lòng cung cấp họ tên và mật khẩu.' });
  }

  // Tiêu chí bảo mật mật khẩu
  if (password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu phải chứa tối thiểu 6 ký tự.' });
  }
  if (!/\d/.test(password)) {
    return res.status(400).json({ error: 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9).' });
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
    return res.status(400).json({ error: 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%...).' });
  }

  const cleanPhone = phone ? phone.replace(/\D/g, '') : null;
  // Fallback email nếu người dùng chỉ đăng ký bằng SĐT
  const finalEmail = (email && email.trim()) ? email.trim() : `${cleanPhone || Date.now()}@shoplite.local`;

  try {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Tạo User chuẩn (role 'customer')
    const userResult = await pool.query(
      'INSERT INTO Users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role, avatar_url',
      [name, finalEmail, password_hash, cleanPhone, 'customer']
    );
    const newUser = userResult.rows[0];

    // Tự động cấp phát JWT token để người dùng đăng nhập ngay sau đăng ký
    const accessToken = jwt.sign(
      { 
        id: newUser.id, 
        role: newUser.role,
        shopId: null 
      },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { id: newUser.id },
      process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      message: 'User registered successfully', 
      token: accessToken,
      refreshToken,
      user: newUser 
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email hoặc số điện thoại đã tồn tại trên hệ thống.' });
    }
    res.status(500).json({ error: 'Database error during registration' });
  }
};

// 4. Đăng nhập tài khoản (Hỗ trợ cả Email lẫn Số điện thoại)
const login = async (req, res) => {
  const { email, password } = req.body; // 'email' can be email or phone
  try {
    const cleanIdentifier = email ? email.trim() : '';
    const cleanPhone = cleanIdentifier.replace(/\D/g, '');

    const result = await pool.query(
      'SELECT * FROM Users WHERE email = $1 OR (phone IS NOT NULL AND phone = $2)', 
      [cleanIdentifier, cleanPhone || cleanIdentifier]
    );
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'Tài khoản không tồn tại trên hệ thống.' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Mật khẩu không chính xác.' });

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

// 5. Lấy thông tin cá nhân hiện tại
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

// 6. Refresh Token
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

// 7. Cập nhật thông tin cá nhân (Profile)
const updateProfile = async (req, res) => {
  const { name, phone, email, avatar_url, gender, date_of_birth, username } = req.body;
  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(name.trim());
    }
    if (phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(phone ? phone.replace(/\D/g, '') : null);
    }
    if (email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(email.trim());
    }
    if (avatar_url !== undefined) {
      fields.push(`avatar_url = $${idx++}`);
      values.push(avatar_url);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Không có thông tin cần cập nhật.' });
    }

    values.push(req.userId);
    const query = `UPDATE Users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, phone, avatar_url, role, created_at`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = {
      ...result.rows[0],
      gender: gender || null,
      date_of_birth: date_of_birth || null,
      username: username || null
    };

    res.json({ message: 'Cập nhật hồ sơ thành công!', user: updatedUser });
  } catch (error) {
    console.error('[updateProfile Error]:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email hoặc số điện thoại đã tồn tại trên hệ thống.' });
    }
    res.status(500).json({ error: 'Database error' });
  }
};

// 8. Đổi mật khẩu (Change Password)
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
  }

  // Validate new password security criteria
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
  }
  if (!/\d/.test(newPassword)) {
    return res.status(400).json({ error: 'Mật khẩu mới phải chứa ít nhất 1 chữ số (0-9).' });
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword)) {
    return res.status(400).json({ error: 'Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt (!@#$%...).' });
  }

  try {
    const userRes = await pool.query('SELECT password_hash FROM Users WHERE id = $1', [req.userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác.' });
    }

    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);
    await pool.query('UPDATE Users SET password_hash = $1 WHERE id = $2', [newHash, req.userId]);

    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error('[changePassword Error]:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = { register, login, getProfile, refresh, sendOtp, verifyOtp, updateProfile, changePassword };
