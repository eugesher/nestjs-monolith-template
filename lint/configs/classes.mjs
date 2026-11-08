import perfectionist from 'eslint-plugin-perfectionist';

export const classes = {
  files: ['**/*.ts'],
  plugins: { perfectionist },
  rules: {
    'perfectionist/sort-classes': [
      'error',
      {
        type: 'unsorted',
        groups: [
          'index-signature',
          ['static-property', 'static-accessor-property'],
          ['static-get-method', 'static-set-method'],
          ['property', 'accessor-property'],
          ['get-method', 'set-method'],
          ['protected-static-property', 'protected-static-accessor-property'],
          ['protected-static-get-method', 'protected-static-set-method'],
          ['protected-property', 'protected-accessor-property'],
          ['protected-get-method', 'protected-set-method'],
          ['private-static-property', 'private-static-accessor-property'],
          ['private-static-get-method', 'private-static-set-method'],
          ['private-property', 'private-accessor-property'],
          ['private-get-method', 'private-set-method'],
          'static-block',
          'constructor',
          ['static-method', 'static-function-property'],
          ['method', 'function-property'],
          ['protected-static-method', 'protected-static-function-property'],
          ['protected-method', 'protected-function-property'],
          ['private-static-method', 'private-static-function-property'],
          ['private-method', 'private-function-property'],
          'unknown',
        ],
      },
    ],
  },
};
