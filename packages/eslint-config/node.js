import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintConfigTurbo from 'eslint-config-turbo/flat';

export default tseslint.config({
  files: ['**/*.ts'],
  extends: [
    eslintConfigTurbo,
    eslint.configs.recommended,
    tseslint.configs.strict,
    eslintConfigPrettier,
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
});
