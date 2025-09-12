// eslint.config.js
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import refreshPlugin from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // Base TypeScript configurations (non-type-aware)
  ...tseslint.configs.recommended,

  // Main configuration for all TS/TSX files
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': hooksPlugin,
      'react-refresh': refreshPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // THIS IS THE FIX: Point to the actual project files
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      // Recommended rules from plugins
      ...pluginReact.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,

      // Custom rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // --- ADD THIS NEW CONFIGURATION OBJECT ---
  {
    files: ['**/*.test.{ts,tsx}'], // Target only test files
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Turn the rule off for these files
    },
  },
  // -----------------------------------------

  // Prettier configuration - MUST BE THE LAST ONE
  prettierConfig,
);
