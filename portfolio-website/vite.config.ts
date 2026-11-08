import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { photoColors } from './photo-colors-plugin.js';

export default defineConfig({
  plugins: [react(), photoColors()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    target: 'es2022',
  },
});
