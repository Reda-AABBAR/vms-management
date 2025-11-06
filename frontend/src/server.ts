import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import express from 'express';
import * as bootstrap from '../dist/server/main.js';
import { APP_BASE_HREF } from '@angular/common';
import { REQUEST } from '@angular/core';
import { renderApplication } from '@angular/platform-server';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_FOLDER = join(__dirname, '../../dist');
const BROWSER_FOLDER = join(DIST_FOLDER, 'browser');
const INDEX_HTML = join(BROWSER_FOLDER, 'index.html');

if (!existsSync(INDEX_HTML)) {
  console.error('❌ index.html not found. Run `ng build --configuration production` first.');
  process.exit(1);
}

const indexHtml = readFileSync(INDEX_HTML, 'utf-8');
const app = express();

app.use(express.static(BROWSER_FOLDER, { maxAge: '1y' }));

app.get(/(.*)/, async (req, res) => {
  try {
    const html = await renderApplication(bootstrap.bootstrap, {
      document: indexHtml,
      url: req.url,
      platformProviders: [
        { provide: APP_BASE_HREF, useValue: req.baseUrl },
        { provide: REQUEST, useValue: req },
      ],
    });
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('SSR Error:', err);
    res.status(500).send('Server Error');
  }
});

const port = process.env['PORT'] || 4000;
const host = process.env['HOST'] || '0.0.0.0';
app.listen(port,host, () => console.log(`✅ Angular SSR running at http://${host}:${port}`));
