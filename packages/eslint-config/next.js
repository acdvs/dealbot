import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import nextTSConfig from 'eslint-config-next/typescript';
import turboConfig from 'eslint-config-turbo/flat';
import nextPlugin from '@next/eslint-plugin-next';

export default defineConfig([
  {
    plugins: {
      next: nextPlugin,
    },
    settings: {
      next: {
        rootDir: 'apps/web/',
      },
    },
  },
  {
    rules: {
      // Temporary fix for next/typescript bugs
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  turboConfig,
  nextTSConfig,
  prettierConfig,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
