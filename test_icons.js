const https = require('https');

const brands = [
  'nike', 'adidas', 'puma', 'zara', 'uniqlo', 'calvinklein', 'underarmour', 'thenorthface', 'levis', 'hugoboss',
  'apple', 'samsung', 'sony', 'dell', 'asus', 'intel', 'lg', 'panasonic', 'hp', 'lenovo',
  'ikea', 'target', 'walmart', 'ebay', 'amazon', 'costco', 'starbucks', 'mcdonalds', 'coca-cola', 'pepsi'
];

brands.forEach(b => {
  const url = `https://cdn.simpleicons.org/${b}`;
  https.get(url, (res) => {
    if(res.statusCode !== 200) console.log(`${res.statusCode} - ${b}`);
  }).on('error', (e) => {});
});
