// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://peruvianflavorscoffee.com',
  integrations: [sitemap()],
  output: "static"
});
