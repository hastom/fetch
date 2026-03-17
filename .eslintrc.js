module.exports = {
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.test.json'],
    requireConfigFile: false,
  },
  extends: [
    '@hastom/eslint-config/typescript-pure',
  ],
  rules: {
    'no-empty-function': 'off',
  },
}
