const http = require('http');

const data = JSON.stringify({
  redesignedImage: "data:image/jpeg;base64,...", // Mock image string
  analysisText: "The room has a minimalist sofa, a round coffee table, and an accent floor lamp."
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/detect-objects',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
