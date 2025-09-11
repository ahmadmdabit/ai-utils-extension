// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Add this build configuration
  build: {
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        service_worker: resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        // THE FIX IS HERE: Use a function to control output paths
        entryFileNames: (chunkInfo) => {
          // If the entry point is our service worker, place it at the root.
          if (chunkInfo.name === 'service_worker') {
            return 'service-worker.js';
          }
          // Otherwise, place it in the assets folder.
          return 'assets/[name].js';
        },
        chunkFileNames: `assets/chunk-[name].js`,
        assetFileNames: `assets/asset-[name].[ext]`,
      },
    },
  },
});
