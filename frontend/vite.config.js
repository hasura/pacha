import path from 'path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@console': path.resolve(__dirname, './packages/console'),
      '@': path.resolve(__dirname, './packages'),
    },
  },
});
