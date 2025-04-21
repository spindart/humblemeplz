const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Ensure .next directory and trace directory exist
const nextDir = path.join(__dirname, '.next');
const traceDir = path.join(nextDir, 'trace');

// Create directories if they don't exist
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
}
if (!fs.existsSync(traceDir)) {
  fs.mkdirSync(traceDir, { recursive: true });
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Create the Next.js app with more robust error handling
const app = next({ 
  dev, 
  hostname, 
  port,
  conf: {
    distDir: '.next',
    // Disable features that might cause issues in Azure
    experimental: {
      outputFileTracingRoot: __dirname,
    }
  }
});

const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch(err => {
    console.error('Error occurred during Next.js initialization:', err);
    process.exit(1);
  });