const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

async function check() {
  try {
    const res = await pool.query("SELECT * FROM Products WHERE 1=1 AND category_id = (SELECT id FROM Categories WHERE name = $1) ORDER BY id ASC LIMIT 5", ["Men's Fashion"]);
    console.log(res.rows.map(r => ({ id: r.id, name: r.name, category_id: r.category_id })));
  } finally {
    pool.end();
  }
}

check();
