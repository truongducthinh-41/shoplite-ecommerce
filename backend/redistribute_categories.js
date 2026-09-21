require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

async function redistribute() {
  try {
    console.log("Fetching all categories...");
    const categoryRes = await pool.query('SELECT id, name FROM Categories');
    const categories = categoryRes.rows;
    
    if (categories.length === 0) {
      console.log("No categories found!");
      return;
    }

    const categoryMap = {};
    categories.forEach(c => categoryMap[c.name] = c.id);

    const electronicsId = categoryMap["Smartphones & Accessories"] || categoryMap["Electronics"] || categories[0].id;
    const laptopsId = categoryMap["Laptops & Computers"] || electronicsId;
    const gamingId = categoryMap["Gaming"] || electronicsId;

    console.log("Moving specific tech products to appropriate categories...");
    // Move iPhones and Apple stuff to Smartphones
    await pool.query(
      "UPDATE Products SET category_id = $1 WHERE name ILIKE '%iPhone%' OR name ILIKE '%Adapter%' OR name ILIKE '%Apple%' OR name ILIKE '%Samsung%' OR name ILIKE '%Phone%'",
      [electronicsId]
    );

    // Move MacBooks to Laptops
    await pool.query(
      "UPDATE Products SET category_id = $1 WHERE name ILIKE '%MacBook%' OR name ILIKE '%Laptop%' OR name ILIKE '%Dell%'",
      [laptopsId]
    );

    // Move Zelda/Nintendo to Gaming
    await pool.query(
      "UPDATE Products SET category_id = $1 WHERE name ILIKE '%Zelda%' OR name ILIKE '%Nintendo%' OR name ILIKE '%PlayStation%'",
      [gamingId]
    );

    console.log("Distributing the rest of the randomly generated products evenly...");
    // Let's get all product IDs that are still in the first category (which got all 100k dumped in)
    // Assuming Men's Fashion (or whichever the first is) holds most of them.
    // Instead of querying all 100k, we can use a clever SQL update with modulo!
    
    // We want to update all products that don't match specific tech keywords, spreading them across all category IDs.
    // We can use the product's ID modulo the number of categories to assign it evenly!
    
    const numCategories = categories.length;
    // We will build a CASE statement to assign category_id based on (id % numCategories)
    // id % numCategories will be 0 to numCategories-1
    
    let caseStatement = `CASE (id % ${numCategories}) `;
    categories.forEach((cat, index) => {
      caseStatement += `WHEN ${index} THEN ${cat.id} `;
    });
    caseStatement += `END`;

    const updateQuery = `
      UPDATE Products 
      SET category_id = ${caseStatement}
      WHERE NOT (name ILIKE '%iPhone%' OR name ILIKE '%Adapter%' OR name ILIKE '%Apple%' OR name ILIKE '%MacBook%' OR name ILIKE '%Zelda%')
    `;

    console.log("Executing massive even distribution update...");
    const res = await pool.query(updateQuery);
    console.log(`Successfully redistributed ${res.rowCount} products across all ${numCategories} categories!`);
    
  } catch (err) {
    console.error("Error during redistribution:", err);
  } finally {
    pool.end();
  }
}

redistribute();
