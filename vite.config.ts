import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` makes a normal static site (GitHub Pages ready).
// `npm run build:single` makes one self contained HTML file for sharing a demo.
const single = !!process.env.SINGLE;

export default defineConfig({
  base: './',
  plugins: single ? [react(), viteSingleFile()] : [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    reportCompressedSize: true,
    rollupOptions: single ? undefined : {
      output: {
        // Framework code changes rarely; keeping it in its own file lets browsers cache it across updates.
        manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom'], motion: ['framer-motion'] },
      },
    },
  },
});
