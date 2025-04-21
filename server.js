// Custom server for Azure App Service
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Force production mode in Azure
const dev = false; // Always use production mode in Azure
const hostname = '0.0.0.0'; // Listen on all network interfaces
const port = process.env.PORT || 8080;

// Initialize Next.js with optimized settings
const app = next({ 
  dev,
  hostname, 
  port,
  conf: {
    compress: true, // Enable compression
    poweredByHeader: false, // Remove X-Powered-By header
  }
});
const handle = app.getRequestHandler();

// Log startup time
console.log(`[${new Date().toISOString()}] Starting Next.js server initialization...`);
const startTime = Date.now();

app.prepare().then(() => {
  console.log(`[${new Date().toISOString()}] Next.js initialized in ${(Date.now() - startTime)/1000} seconds`);
  
  createServer(async (req, res) => {
    try {
      // Add basic caching headers for static assets
      if (req.url.startsWith('/_next/static/') || req.url.startsWith('/static/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      
      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error handling request:`, req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`[${new Date().toISOString()}] Server ready on port ${port}`);
  });
});