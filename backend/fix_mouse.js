require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function fix() {
  try {
    const newImg = 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80';
    await pool.query("UPDATE Products SET image_url = $1 WHERE name ILIKE '%Magic Mouse%'", [newImg]);
    const products = await pool.query("SELECT id FROM Products WHERE name ILIKE '%Magic Mouse%'");
    for (const p of products.rows) {
        await pool.query("UPDATE Product_Images SET image_url = $1 WHERE product_id = $2 AND display_order = 0", [newImg, p.id]);
    }
    console.log('Fixed Magic Mouse image successfully.');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

fix();
