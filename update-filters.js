const https = require('https');
const http = require('http');

const config = {
  MIN_WORD_COUNT: 10,
  MAX_WORD_COUNT: 5000,
  MIN_TITLE_LENGTH: 10,
  MAX_TITLE_LENGTH: 200,
  EXCLUDE_KEYWORDS: [],
  INCLUDE_KEYWORDS: ['Save', 'Deal', 'Off', 'Discount', 'Offer', 'Amazing'],
  MAX_AGE_HOURS: 72,
  SPAM_INDICATORS: []
};

const postData = JSON.stringify({ config });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/filter-config',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    console.log('Status:', res.statusCode);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(postData);
req.end(); 