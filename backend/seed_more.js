require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const renameMap = {
  'Smartphones & Accessories': 'Điện Thoại',
  'Laptops & Computers': 'Máy Tính',
  'Audio': 'Phụ Kiện',
  'Smart Home & Appliances': 'Điện Gia Dụng',
  'Gaming': 'Đồ Chơi'
};

const newCategories = [
  "Thời Trang Nam", "Thời Trang Nữ", "Mẹ & Bé", "Nhà Cửa", "Sắc Đẹp", 
  "Máy Ảnh", "Sức Khỏe", "Đồng Hồ", "Giày Nữ", "Giày Nam", 
  "Túi Ví Nữ", "Thể Thao", "Bách Hóa", "Ô Tô & Xe Máy", 
  "Nhà Sách", "Thú Cưng", "Quà Tặng", "Voucher"
];

async function seed() {
  try {
    console.log("Renaming existing categories...");
    for (const [oldName, newName] of Object.entries(renameMap)) {
      await pool.query('UPDATE categories SET name = $1 WHERE name = $2', [newName, oldName]);
    }
    
    console.log("Seeding new categories and products...");
    for (const catName of newCategories) {
      let res = await pool.query('SELECT id FROM categories WHERE name = $1', [catName]);
      let catId;
      if (res.rows.length === 0) {
        res = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [catName]);
        catId = res.rows[0].id;
      } else {
        catId = res.rows[0].id;
      }
      
      // Check if products exist
      const countRes = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [catId]);
      if (parseInt(countRes.rows[0].count) < 20) {
        console.log(`Inserting products for ${catName}...`);
        for (let i = 1; i <= 30; i++) {
          const name = `${catName} Item ${i}`;
          const description = `This is a high quality product in the ${catName} category.`;
          const price = (Math.random() * 100 + 10).toFixed(2);
          const stock = Math.floor(Math.random() * 100) + 1;
          const image_url = `https://placehold.co/400x400/222/888?text=${encodeURIComponent(catName)}`;
          
          await pool.query(
            'INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES ($1, $2, $3, $4, $5, $6)',
            [name, description, price, stock, catId, image_url]
          );
        }
      } else {
        console.log(`Category ${catName} already has products.`);
      }
    }
    console.log("Seeding complete!");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    pool.end();
  }
}

seed();
