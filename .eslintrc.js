module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    requireConfigFile: false,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'unused-imports', 'simple-import-sort', 'tailwindcss'],
  extends: ['next', 'next/core-web-vitals', 'plugin:tailwindcss/recommended'],
  rules: {
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    '@next/next/no-html-link-for-pages': ['off', '/api/'],
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@next/next/no-img-element': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'jsx-a11y/role-supports-aria-props': 'off',
    'tailwindcss/no-custom-classname': 'off'
  },
  ignorePatterns: ['/src/generated/types.d.ts', 'functions/lib/**/*']
};
