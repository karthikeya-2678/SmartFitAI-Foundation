module.exports = {
  root: true,
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    // Catch unused variables but allow underscore-prefixed ones
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Warn instead of error on explicit any — useful during early dev
    '@typescript-eslint/no-explicit-any': 'warn',
    // Disallow console.log in production code (warn = CI-safe)
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // Allow non-null assertions (common in RN)
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/', '.expo/', 'scripts/', 'server/'],
};
