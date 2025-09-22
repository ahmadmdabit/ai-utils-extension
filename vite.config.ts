// vite.config.ts
import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import analyze from 'rollup-plugin-analyzer';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Run `yarn build --stats` to generate the report
    ...(process.env.ANALYZE === 'true'
      ? [
          visualizer({
            open: true,
            filename: 'dist/stats.html',
            gzipSize: true,
            brotliSize: true,
          }) as PluginOption,
          analyze({
            summaryOnly: true,
            limit: 20,
          }) as PluginOption,
        ]
      : []),
  ],
  // Add this build configuration
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        service_worker: resolve(__dirname, 'src/background/service-worker.ts'),
        content_script: resolve(
          __dirname,
          'src/content/linkedin-filter-content.ts',
        ),
        filter_styles: resolve(__dirname, 'src/styles/linkedin-filter.css'),
      },
      output: {
        // THE FIX IS HERE: Use a function to control output paths
        entryFileNames: (chunkInfo) => {
          // If the entry point is our service worker, place it at the root.
          if (chunkInfo.name === 'service_worker') {
            return 'service-worker.js';
          }

          // If the entry point is our content script, place it at the root.
          if (chunkInfo.name === 'content_script') {
            return 'content-script.js';
          }

          // Otherwise, place it in the assets folder.
          return 'assets/[name].js';
        },
        chunkFileNames: `assets/chunk-[name].js`,
        assetFileNames: (assetInfo) => {
          // If it's a CSS file, place it at the root

          if (assetInfo.name?.includes('filter_styles')) {
            console.log(assetInfo.name);
            return 'linkedin-filter.css';
          }
          // Otherwise, place it in the assets folder
          return `assets/asset-[name].[ext]`;
        },
      },
    },
  },
});
