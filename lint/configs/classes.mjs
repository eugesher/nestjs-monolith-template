import perfectionist from 'eslint-plugin-perfectionist';

export const classes = {
  files: ['**/*.ts'],
  plugins: { perfectionist },
  rules: {
    'perfectionist/sort-classes': [
      'error',
      {
        type: 'unsorted',
        newlinesBetween: 1,
        newlinesInside: 1,
        groups: [
          'index-signature',
          { group: ['static-property', 'static-accessor-property'], newlinesInside: 0 },
          ['static-get-method', 'static-set-method'],
          { group: ['property', 'accessor-property'], newlinesInside: 'ignore' },
          ['get-method', 'set-method'],
          {
            group: ['protected-static-property', 'protected-static-accessor-property'],
            newlinesInside: 0,
          },
          ['protected-static-get-method', 'protected-static-set-method'],
          {
            group: ['protected-property', 'protected-accessor-property'],
            newlinesInside: 'ignore',
          },
          ['protected-get-method', 'protected-set-method'],
          {
            group: ['private-static-property', 'private-static-accessor-property'],
            newlinesInside: 0,
          },
          ['private-static-get-method', 'private-static-set-method'],
          { group: ['private-property', 'private-accessor-property'], newlinesInside: 'ignore' },
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
