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
    await pool.query(
      "UPDATE Products SET image_url = $1 WHERE id = 8",
      ['https://images.unsplash.com/photo-1678911820864-e6c5bb5d2cf5?auto=format&fit=crop&q=80&w=800&h=800']
    );
    await pool.query(
      "UPDATE Products SET image_url = $1 WHERE id = 9",
      ['https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&q=80&w=800&h=800']
    );
    await pool.query(
      "UPDATE Products SET image_url = $1 WHERE id = 14",
      ['https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800&h=800']
    );
    console.log('Images updated successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

fixImages();
