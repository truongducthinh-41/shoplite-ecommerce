require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function fixImages() {
  try {
    // Apple Magic Mouse
    await pool.query(
      "UPDATE Products SET image_url = $1 WHERE name ILIKE '%Magic Mouse%'",
      ['https://images.unsplash.com/photo-1618424879685-612666d9c6c0?auto=format&fit=crop&q=80&w=800']
    );
    // Zelda
    await pool.query(
      "UPDATE Products SET image_url = $1 WHERE name ILIKE '%Zelda%'",
      ['https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=80&w=800']
    );
    console.log('Images updated successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

fixImages();
