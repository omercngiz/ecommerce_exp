import http from 'node:http';
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(`<h1>Frontend Server Response</h1>
             <p>Bu, frontend sunucusundan gelen bir yanıttır.</p>`);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}/`);
});
