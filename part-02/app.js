const http = require('node:http');
const fs = require('node:fs');

const message = 'Hello from Docker!';
const page = fs.readFileSync('/app/index.html', 'utf8')
  .replace('{{MESSAGE}}', message);

const server = http.createServer((request, response) => {
  console.log(request.method, request.url);
  if (request.url !== '/') {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(page);
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Neufology app is listening on port 3000');
});
