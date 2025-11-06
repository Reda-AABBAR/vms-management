import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import express from 'express';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_FOLDER = join(__dirname, '../dist');
const BROWSER_FOLDER = join(DIST_FOLDER, 'browser');
const SERVER_FOLDER = join(DIST_FOLDER, 'server');
const INDEX_HTML = join(BROWSER_FOLDER, 'index.html');

if (!existsSync(INDEX_HTML)) {
  console.error('❌ index.html not found. Run `ng build --configuration production` first.');
  process.exit(1);
}

if (!existsSync(join(SERVER_FOLDER, 'main.js'))) {
  console.error('❌ Server build not found. Run `ng run frontend:server:production` first.');
  process.exit(1);
}

const indexHtml = readFileSync(INDEX_HTML, 'utf-8');
const app = express();

// Serve static files
app.use(express.static(BROWSER_FOLDER, { maxAge: '1y', index: false }));

// All regular routes use the Angular engine
app.get('*', async (req, res) => {
  try {
    // Dynamically import the server build
    const { default: bootstrap } = await import(join(SERVER_FOLDER, 'main.js'));
    
    // Get the rendered HTML from Angular SSR
    const html = await bootstrap();
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('SSR Error:', err);
    // Fallback to client-side rendering
    res.send(indexHtml);
  }
});

const port = process.env['PORT'] || 4000;
const host = process.env['HOST'] || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`✅ Angular SSR running at http://${host}:${port}`);
});
