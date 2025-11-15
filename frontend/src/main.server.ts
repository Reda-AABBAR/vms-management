import 'zone.js/node';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { App } from './app/app';
import { config } from './app/app.config.server';

export default async function render(opts: { url: string; document: string }) {
  return renderApplication(() => bootstrapApplication(App, { ...config }), {
    document: opts.document,
    url: opts.url,
  });
}

