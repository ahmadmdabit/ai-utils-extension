// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      // --- ADD THE COVERAGE CONFIGURATION HERE ---
      coverage: {
        provider: 'v8', // or 'istanbul'
        reporter: ['text', 'json', 'html'], // Choose your reporters
        
        // Specify files to include
        include: ['src/**/*.{ts,tsx}'],
        
        // Specify files to exclude
        exclude: [
          'src/main.tsx',
          'src/vite-env.d.ts',
          'src/setupTests.ts',
          'src/types/**', // Exclude all type definition files
          'src/**/*.test.{ts,tsx}', // Exclude test files themselves
        ],
        
        // Set coverage thresholds
        thresholds: {
          statements: 15,
          branches: 50,
          functions: 50,
          lines: 15,
        },
      },
      // -----------------------------------------
    },
  })
);