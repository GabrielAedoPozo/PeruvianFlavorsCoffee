// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://peruvianflavorscoffee.com',
  integrations: [],
  adapter: cloudflare(),
});
