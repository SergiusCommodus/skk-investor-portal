import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` makes a normal static site (GitHub Pages ready).
// `npm run build:single` makes one self contained HTML file for sharing a demo.
export default defineConfig({
  base: './',
  plugins: process.env.SINGLE ? [react(), viteSingleFile()] : [react()],
});
