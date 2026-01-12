import http from 'http';

const PORT = 8080;

// HTTP sunucusu oluştur
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('JSON Database Server Running\n');
});

// Sunucuyu başlat
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
