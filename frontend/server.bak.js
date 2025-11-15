import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const browserDist = join(__dirname, 'dist/browser');
const serverDist = join(__dirname, 'dist/server');
const indexHtml = readFileSync(join(browserDist, 'index.html'), 'utf8');

// Check if builds exist
if (!existsSync(join(browserDist, 'index.html'))) {
  console.error('❌ Client build not found. Run: ng build --configuration production');
  process.exit(1);
}

if (!existsSync(join(serverDist, 'main.js'))) {
  console.error('❌ Server build not found. Run: ng run frontend:server:production');
  process.exit(1);
}

// Serve static files
app.use(express.static(browserDist, { 
  maxAge: '1y', 
  index: false,
  etag: false
}));

// SSR all routes
app.get(/(.*)/, async (req, res, next) => {
  try {
    console.log(`📨 Serving: ${req.url}`);
    
    // Import the server module
    const serverModule = await import('./dist/server/main.js');
    
    // The server bundle should export a render function or AppServerModule
    let html = indexHtml;
    
    if (typeof serverModule.default === 'function') {
      // If it exports a render function directly
      html = await serverModule.default();
    } else if (serverModule.AppServerModule) {
      // If it exports AppServerModule, we need to use Angular's platformServer
      const { renderApplication } = await import('@angular/platform-server');
      const { AppComponent } = await import('./dist/browser/main.js');
      
      html = await renderApplication(AppComponent, {
        document: indexHtml,
        url: req.url,
      });
    } else {
      throw new Error('No valid server exports found');
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('❌ SSR Error:', error.message);
    console.log('🔄 Falling back to client-side rendering...');
    res.send(indexHtml);
  }
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Angular SSR Server running on http://${HOST}:${PORT}`);
  console.log('📁 Browser files:', browserDist);
  console.log('📁 Server files:', serverDist);
  console.log('🔍 Check: http://localhost:4000');
});
