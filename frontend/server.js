import 'zone.js/node';
import '@angular/compiler';
import { APP_BASE_HREF } from '@angular/common';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const browserDist = join(__dirname, 'dist/browser');
const serverDist = join(__dirname, 'dist/server');
const indexHtml = readFileSync(join(browserDist, 'index.html'), 'utf8');


if (!existsSync(join(browserDist, 'index.html'))) {
	  console.error('❌ Client build not found. Run: ng build --configuration production');
	  process.exit(1);
}

if (!existsSync(join(serverDist, 'main.js'))) {
	  console.error('❌ Server build not found. Run: ng run frontend:server:production');
	  process.exit(1);
}


app.use(express.static(browserDist, {
	  maxAge: '1y',
	  index: false,
}));


app.get(/(.*)/, async (req, res) => {
	  try {
		      console.log(`📨 Serving: ${req.url}`);


		      const { renderModule } = await import('@angular/platform-server');
		      
		      const serverModule = await import('./dist/server/main.js');
		      
		      const AppServerModule = serverModule.AppServerModule || serverModule.default || serverModule;

		      const { protocol, originalUrl, baseUrl, headers } = req;


		      const html = await renderModule(AppServerModule, {
			            document: indexHtml,
			            url: req.url,
			            extraProviders: [
					            { provide: APP_BASE_HREF, useValue: baseUrl }
					          ]
			          });

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
