const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.yml': 'text/yaml',
  '.yaml': 'text/yaml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  let cleanUrl = req.url.split('?')[0];
  let filePath = path.join(__dirname, '..', cleanUrl === '/' ? 'index.html' : cleanUrl);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }

  // Handle category slug rewrites locally
  const slugToCat = {
    '/flower-bouquets-karachi': 'products.html',
    '/customized-theme-cakes-karachi': 'products.html',
    '/gift-baskets-hampers-karachi': 'products.html',
    '/customized-balloon-boxes': 'products.html',
    '/wooden-gift-crates-pakistan': 'products.html',
    '/personalized-photo-frames-gift': 'products.html',
    '/personalized-gifts-pakistan': 'products.html',
    '/wedding-trousseau-packing-karachi': 'products.html'
  };

  if (slugToCat[cleanUrl]) {
    filePath = path.join(__dirname, '..', slugToCat[cleanUrl]);
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    const notFound = path.join(__dirname, '..', '404.html');
    if (fs.existsSync(notFound)) {
      return fs.createReadStream(notFound).pipe(res);
    }
    return res.end('<h1>404 Not Found</h1>');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });

  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
