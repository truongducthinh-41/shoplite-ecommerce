const { Pool } = require('pg');
require('dotenv').config();

// Hỗ trợ cả 2 cách kết nối:
// 1. Connection String đầy đủ (Supabase DATABASE_URL)
// 2. Từng biến cấu hình riêng biệt (DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT)
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME || process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
      ssl: {
        rejectUnauthorized: false
      }
    };

const pool = new Pool(poolConfig);

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Database connected successfully');
  }
  if (release) release();
});

module.exports = pool;
