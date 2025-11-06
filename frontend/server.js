import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const browserDist = join(__dirname, 'dist/browser');
const serverDist = join(__dirname, 'dist/server');

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

// SSR all routes - Use proper Express 5 syntax
app.get(/(.*)/, async (req, res, next) => {
  try {
    console.log(`📨 Serving: ${req.url}`);
    
    // Dynamically import the Angular server bundle
    const { default: bootstrap } = await import('./dist/server/main.js');
    
    // Render the Angular app
    const html = await bootstrap();
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('❌ SSR Error:', error.message);
    
    // Fallback to client-side only
    console.log('🔄 Falling back to client-side rendering...');
    res.sendFile(join(browserDist, 'index.html'));
  }
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Angular SSR Server running on http://${HOST}:${PORT}`);
  console.log('📁 Browser files:', browserDist);
  console.log('📁 Server files:', serverDist);
  console.log('🔍 Check: http://localhost:4000');
});
