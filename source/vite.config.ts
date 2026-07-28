import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  server: {
    fs: {
      allow: [resolve(import.meta.dirname, '..')],
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        participant: resolve(import.meta.dirname, 'index.html'),
        study: resolve(import.meta.dirname, 'study.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/shared-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
