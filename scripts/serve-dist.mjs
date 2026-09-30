// Dependency-free static file server used by Playwright's webServer.
//
// Usage: node scripts/serve-dist.mjs [directory] [port]
//
// It exists so E2E tests can serve the Angular production build on both
// Windows (local development) and Linux (CI) without requiring Python or any
// additional static-server dependency.

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

const rootDir = resolve(process.argv[2] ?? 'dist/neural-lab/browser');
const port = Number(process.argv[3] ?? 4173);
const host = '127.0.0.1';

function resolveRequestPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  let filePath = resolve(join(rootDir, normalized));

  if (filePath !== rootDir && !filePath.startsWith(rootDir + sep)) {
    return null;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }

  if (existsSync(filePath)) {
    return filePath;
  }

  // SPA fallback for extension-less deep links.
  if (!extname(filePath)) {
    const indexPath = join(rootDir, 'index.html');
    if (existsSync(indexPath)) {
      return indexPath;
    }
  }

  return null;
}

const server = createServer((req, res) => {
  const filePath = resolveRequestPath(req.url ?? '/');

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const contentType = MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
});

server.listen(port, host, () => {
  console.log(`Serving ${rootDir} at http://${host}:${port}`);
});