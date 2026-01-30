
const express = require('express');
const next = require('next');
const { parse } = require('url');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Explicitly bind to 0.0.0.0

// Create the Next.js app instance
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // The custom server should pass all requests to the Next.js handler
  server.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true);
    return handle(req, res, parsedUrl);
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}).catch(err => {
    console.error('Error preparing Next.js app:', err);
    process.exit(1);
});
