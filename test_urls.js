const https = require('https');

const urls = [
  "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
  "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/8/88/Puma_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/9/92/UNIQLO_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/c/ca/Gucci_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/3/37/Chanel_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/1/1c/Levis_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/1/14/Calvin_Klein_logo.svg"
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(`${res.statusCode} - ${url}`);
  }).on('error', (e) => {
    console.error(e);
  });
});
