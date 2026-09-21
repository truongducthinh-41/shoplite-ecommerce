const http = require('http');

http.get("http://localhost:3000/api/products?limit=5&offset=0&category=Men%27s%20Fashion", (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
