module.exports = {
    env: {
      browser: true,
      es2021: true,
      node: true,  // Add this line
    },
    extends: [
      'eslint:recommended',
      'plugin:@next/next/recommended',
      'plugin:react/recommended',
      'plugin:prettier/recommended',
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['react', '@next/next'],
    rules: {
      // Add any custom rules here
    },
  };
  