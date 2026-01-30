
const http = require('http');

const port = process.env.PORT || 3000;
// Escuchamos explícitamente en 0.0.0.0
const host = '0.0.0.0';

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Test Server is OK\n');
});

server.listen(port, host, () => {
  console.log(`>>> TEST SERVER RUNNING at http://${host}:${port}/`);
  console.log(`>>> Listening on port derived from process.env.PORT: ${process.env.PORT}`);
});

