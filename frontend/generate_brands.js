import fs from 'fs';

const categories = [
  "Men's Fashion", "Women's Fashion", "Smartphones & Accessories", "Mom & Baby",
  "Electronics", "Home & Living", "Laptops & Computers", "Beauty", "Cameras",
  "Health", "Watches", "Women's Shoes", "Men's Shoes", "Women's Bags",
  "Smart Home & Appliances", "Audio", "Sports & Outdoors", "Groceries",
  "Automotive", "Books & Stationery", "Gaming", "Pet Supplies", "Gifts", "Vouchers"
];

// Base real brands for key categories
const baseBrands = {
  "Men's Fashion": ['Armani', 'Hugo Boss', 'Zara', 'H&M', 'Coolmate', 'Aristino', 'Biluxury', 'Owen', 'Việt Tiến', 'YaMe', 'Routine', 'PT2000', 'Poloman', 'Ralph Lauren', 'Tommy Hilfiger', 'Lacoste', "Levi's", 'Diesel', 'Guess', 'Calvin Klein'],
  "Women's Fashion": ['Chanel', 'Dior', 'Gucci', 'Prada', 'Hermès', 'Elise', 'Gumac', 'Ivy Moda', 'NEM', 'HNOSS', 'Juno', 'Vascara', 'Marc', 'Mango', 'Forever 21', "Victoria's Secret", 'Burberry', 'Fendi', 'Valentino', 'Balenciaga'],
  "Smartphones & Accessories": ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Huawei', 'Sony', 'OnePlus', 'Google', 'Nokia', 'Asus', 'Motorola', 'Baseus', 'Anker', 'Ugreen', 'Spigen', 'Hoco', 'Remax', 'Pisen'],
  "Laptops & Computers": ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI', 'Gigabyte', 'Intel', 'AMD', 'Nvidia', 'Razer', 'Corsair', 'Logitech', 'Kingston', 'Western Digital', 'Seagate', 'Crucial', 'Samsung', 'Microsoft'],
  "Beauty": ["L'Oréal", 'Maybelline', 'MAC', 'Estée Lauder', 'Clinique', 'Innisfree', 'Laneige', 'The Body Shop', "Kiehl's", 'Shiseido', 'Olay', 'Neutrogena', 'Nivea', 'Garnier', 'Lancôme', 'Vichy', 'La Roche-Posay', 'Cerave', 'Cetaphil', 'Avon'],
  "Sports & Outdoors": ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Reebok', 'Asics', 'New Balance', 'Fila', 'Skechers', 'Columbia', 'The North Face', 'Patagonia', 'Salomon', 'Marmot', "Arc'teryx", 'Oakley', 'Burton', 'Vans', 'Converse', 'Champion'],
  "Watches": ['Rolex', 'Omega', 'Casio', 'Seiko', 'Citizen', 'Tissot', 'Fossil', 'Daniel Wellington', 'Orient', 'Tag Heuer', 'Cartier', 'Patek Philippe', 'Breitling', 'Hublot', 'Longines', 'Timex', 'G-Shock', 'Garmin', 'Suunto', 'Fitbit'],
  "Audio": ['Sony', 'Bose', 'Sennheiser', 'JBL', 'Harman Kardon', 'Audio-Technica', 'Beats', 'Bang & Olufsen', 'Marshall', 'Shure', 'AKG', 'Pioneer', 'Jabra', 'Bowers & Wilkins', 'Klipsch', 'Skullcandy', 'Anker Soundcore', 'Edifier', 'Rode', 'Yamaha']
};

const prefixes = ['Pro', 'Elite', 'Prime', 'Ultra', 'Neo', 'Max', 'Aero', 'Zen', 'Eco', 'Smart', 'True', 'Pure', 'Vibe', 'Core', 'Nova', 'Lumina', 'Aura', 'Omni', 'Nexus', 'Vertex', 'Apex', 'Pinnacle', 'Summit', 'Zenith', 'Crest', 'Crown', 'Royal', 'Imperial', 'Majestic', 'Noble'];
const suffixes = ['Style', 'Tech', 'Gear', 'Wear', 'Fit', 'Life', 'Home', 'Care', 'Plus', 'Pro', 'Max', 'One', 'X', 'Z', 'Hub', 'Zone', 'Lab', 'Studio', 'Works', 'Craft', 'Forge', 'Vision', 'Concept', 'Design', 'Trends', 'Vogue', 'Chic', 'Glam', 'Glow', 'Shine'];
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const result = {};

categories.forEach(cat => {
  result[cat] = [];
  const existingNames = new Set();
  
  if (baseBrands[cat]) {
    baseBrands[cat].forEach(name => {
      const url = ['apple', 'samsung', 'zara', 'h&m', 'nike', 'adidas', 'sony', 'dell'].includes(name.toLowerCase()) 
        ? `https://cdn.simpleicons.org/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}/white`
        : `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com&size=128`;
      
      result[cat].push({ name, url });
      existingNames.add(name);
    });
  }

  while (result[cat].length < 114) {
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    let newName = '';
    
    const rand = Math.random();
    if (rand < 0.5) {
      newName = p + ' ' + s;
    } else if (rand < 0.8) {
      const l1 = letters[Math.floor(Math.random() * letters.length)];
      const l2 = letters[Math.floor(Math.random() * letters.length)];
      newName = l1 + l2 + ' ' + s;
    } else {
      newName = p + ' ' + Math.floor(Math.random() * 99 + 1);
    }
    
    if (cat.includes('Fashion') || cat.includes('Shoes') || cat.includes('Bags')) {
      newName += Math.random() > 0.5 ? ' Studio' : ' Apparel';
    } else if (cat.includes('Smartphones') || cat.includes('Laptops') || cat.includes('Electronics')) {
      newName += Math.random() > 0.5 ? ' Tech' : ' Digital';
    } else if (cat.includes('Beauty') || cat.includes('Health')) {
      newName += Math.random() > 0.5 ? ' Care' : ' Wellness';
    } else if (cat.includes('Home')) {
      newName += ' Living';
    }

    newName = newName.replace(/ (Studio|Apparel|Tech|Digital|Care|Wellness|Living)+/g, ' $1');
    newName = newName + ' ' + (result[cat].length + 1); 

    if (!existingNames.has(newName)) {
      existingNames.add(newName);
      result[cat].push({
        name: newName,
        url: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=111&color=fff&size=256&font-size=0.33`
      });
    }
  }
  
  // Sort alphabetically
  result[cat].sort((a, b) => a.name.localeCompare(b.name));
});

if (!fs.existsSync('src/data')) {
    fs.mkdirSync('src/data', { recursive: true });
}
fs.writeFileSync('src/data/brands.json', JSON.stringify(result, null, 2));
console.log('Successfully generated src/data/brands.json with 24 categories x 114 brands!');
