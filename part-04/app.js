const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const DATA = '/data';
const FILE = path.join(DATA, 'notes.json');
async function readNote() {
  try { return JSON.parse(await fs.readFile(FILE, 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return { text: '' }; throw e; }
}
const server = http.createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    if (req.method === 'GET' && req.url === '/') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(await fs.readFile(path.join(__dirname, 'index.html')));
    }
    if (req.method === 'GET' && req.url === '/api/note') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(await readNote()));
    }
    if (req.method === 'POST' && req.url === '/api/note') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 8000) { res.writeHead(413); return res.end(); }
      }
      const { text } = JSON.parse(body);
      if (typeof text !== 'string' || text.length > 500) {
        res.writeHead(400); return res.end('Use up to 500 characters.');
      }
      await fs.mkdir(DATA, { recursive: true });
      await fs.writeFile(FILE + '.tmp', JSON.stringify({ text }, null, 2) + '\n');
      await fs.rename(FILE + '.tmp', FILE);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ text }));
    }
    res.writeHead(404); res.end('Not found');
  } catch (e) {
    console.error(e.message);
    res.writeHead(500); res.end('Could not save or read the note.');
  }
});
server.listen(3000, '0.0.0.0', () => console.log('Neufology Notes is ready on port 3000. Data: /data/notes.json'));
