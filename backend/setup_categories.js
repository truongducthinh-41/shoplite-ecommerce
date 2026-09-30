require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const categories = [
  "Men's Fashion", "Women's Fashion", "Smartphones & Accessories", "Mom & Baby",
  "Electronics", "Home & Living", "Laptops & Computers", "Beauty", "Cameras",
  "Health", "Watches", "Women's Shoes", "Men's Shoes", "Women's Bags",
  "Smart Home & Appliances", "Audio", "Sports & Outdoors", "Groceries",
  "Automotive", "Books & Stationery", "Gaming", "Pet Supplies", "Gifts", "Vouchers"
];

async function setup() {
  try {
    for (const cat of categories) {
      const res = await pool.query('SELECT id FROM Categories WHERE name = $1', [cat]);
      if (res.rows.length === 0) {
        await pool.query('INSERT INTO Categories (name, description) VALUES ($1, $2)', [cat, cat + ' description']);
        console.log('Inserted category:', cat);
      } else {
        console.log('Category already exists:', cat);
      }
    }
    console.log("All categories verified!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

setup();
