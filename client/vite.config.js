import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(projectRoot, 'shared'),
    },
  },
  server: {
    port: 5173,
    fs: { allow: [projectRoot] },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
  },
});
