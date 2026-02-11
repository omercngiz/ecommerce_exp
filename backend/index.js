import http from 'node:http';

const server = http.createServer();

server.on('request', (req, res) => {
  // CORS headers - frontend'den istek gelebilmesi için
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Server response message\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});