// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: "https://GabrielAedoPozo.github.io",
    base: "/PeruvianFlavorsCoffee/",
    output: 'static',
    build: {
        assets: 'assets'
    }
});