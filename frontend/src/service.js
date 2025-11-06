const path = require('path');
const fs = require('fs');
const express = require('express');
const { bootstrap } = require('../dist/server/main.js'); // CommonJS bundle
const { APP_BASE_HREF } = require('@angular/common');
const { REQUEST } = require('@angular/core');
const { renderApplication } = require('@angular/platform-server');

const DIST_FOLDER = path.join(__dirname, '../dist');
const BROWSER_FOLDER = path.join(DIST_FOLDER, 'browser');
const INDEX_HTML = path.join(BROWSER_FOLDER, 'index.html');

if (!fs.existsSync(INDEX_HTML)) {
  console.error('❌ index.html not found. Run `ng build --configuration production` first.');
  process.exit(1);
}

const indexHtml = fs.readFileSync(INDEX_HTML, 'utf-8');
const app = express();

app.use(express.static(BROWSER_FOLDER, { maxAge: '1y' }));

app.get(/.*/, async (req, res) => {
  try {
    const html = await renderApplication(bootstrap, {
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

const port = process.env.PORT || 4000;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => console.log(`✅ Angular SSR running at http://${host}:${port}`));
