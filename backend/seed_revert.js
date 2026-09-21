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
  "Thời Trang Nam": "Men's Fashion",
  "Thời Trang Nữ": "Women's Fashion",
  "Mẹ & Bé": "Mom & Baby",
  "Nhà Cửa": "Home & Living",
  "Sắc Đẹp": "Beauty",
  "Máy Ảnh": "Cameras",
  "Sức Khỏe": "Health",
  "Đồng Hồ": "Watches",
  "Giày Nữ": "Women's Shoes",
  "Giày Nam": "Men's Shoes",
  "Túi Ví Nữ": "Women's Bags",
  "Thể Thao": "Sports & Outdoors",
  "Bách Hóa": "Groceries",
  "Ô Tô & Xe Máy": "Automotive",
  "Nhà Sách": "Books & Stationery",
  "Thú Cưng": "Pet Supplies",
  "Quà Tặng": "Gifts",
  "Voucher": "Vouchers",
  "Điện Thoại": "Smartphones & Accessories",
  "Máy Tính": "Laptops & Computers",
  "Phụ Kiện": "Audio",
  "Điện Gia Dụng": "Smart Home & Appliances",
  "Đồ Chơi": "Gaming"
};

async function seed() {
  try {
    console.log("Renaming existing categories to English...");
    for (const [oldName, newName] of Object.entries(renameMap)) {
      await pool.query('UPDATE categories SET name = $1 WHERE name = $2', [newName, oldName]);
      // Also update products if they have Vietnamese in names
      await pool.query("UPDATE products SET name = REPLACE(name, $1, $2) WHERE name LIKE '%' || $1 || '%'", [oldName, newName]);
    }
    console.log("Renaming complete!");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    pool.end();
  }
}

seed();
