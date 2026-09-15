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
    const pencilImg = 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=80';
    await pool.query("UPDATE Products SET image_url = $1 WHERE name ILIKE '%Apple Pencil%'", [pencilImg]);
    const products = await pool.query("SELECT id FROM Products WHERE name ILIKE '%Apple Pencil%'");
    for (const p of products.rows) {
        await pool.query("UPDATE Product_Images SET image_url = $1 WHERE product_id = $2 AND display_order = 0", [pencilImg, p.id]);
    }
    console.log('Fixed Apple Pencil image successfully.');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

fix();
