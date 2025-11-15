
// server.mjs - in project root
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_FOLDER = join(__dirname, 'dist');
const BROWSER_FOLDER = join(DIST_FOLDER, 'browser');
const SERVER_FOLDER = join(DIST_FOLDER, 'server');
const INDEX_HTML = join(BROWSER_FOLDER, 'index.html');
const SERVER_BUNDLE = join(SERVER_FOLDER, 'main.js');

if (!existsSync(INDEX_HTML) || !existsSync(SERVER_BUNDLE)) {
  console.error('❌ Browser or server build missing. Build first!');
  process.exit(1);
}

const indexHtml = readFileSync(INDEX_HTML, 'utf-8');
const app = express();

app.use(express.static(BROWSER_FOLDER, { maxAge: '1y', index: false }));

app.get(/.*/, async (req, res) => {
  try {
    const { AppServerModule, default: bootstrap } = await import(SERVER_BUNDLE);

    // Use the Angular bootstrap function
    const html = await bootstrap(AppServerModule, {
      document: indexHtml,
      url: req.originalUrl
    });

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('SSR Error:', err);
    res.send(indexHtml);
  }
});

const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 4000;
app.listen(port, '0.0.0.0', () =>
  console.log(`✅ Angular SSR running at http://0.0.0.0:${port}`)
);
