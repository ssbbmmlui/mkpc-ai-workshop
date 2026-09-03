import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages hosts this repo at /mkpc-ai-workshop/. Local `vite` stays at `/`.
  base: process.env.GITHUB_ACTIONS ? '/mkpc-ai-workshop/' : '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
