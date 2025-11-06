// server.cjs
const express = require('express');
const { join } = require('path');
const fs = require('fs');
const { renderModule } = require('@angular/platform-server');
const { AppServerModule } = require('../dist/server/main');

const DIST_FOLDER = join(__dirname, '../dist/browser');
const INDEX_HTML = join(DIST_FOLDER, 'index.html');

const app = express();

app.use(express.static(DIST_FOLDER, { maxAge: '1y' }));

app.get('*', async (req, res) => {
  try {
    const html = await renderModule(AppServerModule, {
      document: fs.readFileSync(INDEX_HTML, 'utf-8'),
      url: req.url,
    });
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('SSR Error:', err);
    res.status(500).send('Server Error');
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ SSR running at http://localhost:${port}`));

