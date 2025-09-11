// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this build configuration
  build: {
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'public/sidepanel.html'),
        service_worker: resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
