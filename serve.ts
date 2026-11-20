// Leonida Trophy Guide — tiny static server for local use (Node 22, stdlib only).
// Serves app/ at http://localhost:8080. No build step, no network use.
// Usage: node serve.ts [port]

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('app', import.meta.url)));
const port = Number(process.argv[2] || 8080);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = createServer((req, res) => {
  const rawPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const rel = normalize(rawPath).replace(/^[/\\]+/, '');
  const file = resolve(join(appRoot, rel === '' ? 'index.html' : rel));
  if (!file.startsWith(appRoot + '/') && file !== appRoot) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  const target = existsSync(file) && statSync(file).isDirectory() ? join(file, 'index.html') : file;
  if (!existsSync(target) || !statSync(target).isFile()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(target)] ?? 'application/octet-stream' });
  createReadStream(target).pipe(res);
});

server.listen(port, () => {
  console.log('Leonida Trophy Guide at http://localhost:' + port);
});
