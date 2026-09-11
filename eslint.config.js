import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import storybook from 'eslint-plugin-storybook'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'storybook-static/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  ...storybook.configs['flat/recommended'],
  {
    files: ['.storybook/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ['*.config.ts', '*.config.js', 'scripts/**/*.{js,mjs,ts}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
)
