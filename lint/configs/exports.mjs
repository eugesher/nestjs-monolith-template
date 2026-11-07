import perfectionist from 'eslint-plugin-perfectionist';

export const exports = {
  files: ['**/*.ts'],
  plugins: { perfectionist },
  rules: {
    'perfectionist/sort-exports': [
      'error',
      {
        type: 'alphabetical',
        ignoreCase: true,
        partitionByNewLine: true,
      },
    ],
  },
};
