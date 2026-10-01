const http = require('node:http');

const port = Number(process.env.PORT || 3000);
const version = process.env.APP_VERSION || '1.0.0';
const server = http.createServer((req, res) => {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  if (req.url === '/health') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'UP' }));
  }
  if (req.url === '/version') {
    res.writeHead(200);
    return res.end(JSON.stringify({ version }));
  }
  res.writeHead(200);
  res.end(JSON.stringify({ service: 'aws-ha-dr-demo', version, endpoints: ['/health', '/version'] }));
});

server.listen(port, '0.0.0.0', () => console.log(`demo listening on ${port}; version=${version}`));
