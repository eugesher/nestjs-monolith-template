import perfectionist from 'eslint-plugin-perfectionist';

export const classes = {
  files: ['**/*.ts'],
  plugins: { perfectionist },
  rules: {
    'perfectionist/sort-classes': ['error', { type: 'unsorted' }],
  },
};
