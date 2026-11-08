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
          { group: ['decorated-property', 'decorated-accessor-property'], newlinesInside: 1 },
          { group: ['property', 'accessor-property'], newlinesInside: 0 },
          ['get-method', 'set-method'],
          {
            group: ['protected-static-property', 'protected-static-accessor-property'],
            newlinesInside: 0,
          },
          ['protected-static-get-method', 'protected-static-set-method'],
          {
            group: ['protected-decorated-property', 'protected-decorated-accessor-property'],
            newlinesInside: 1,
          },
          { group: ['protected-property', 'protected-accessor-property'], newlinesInside: 0 },
          ['protected-get-method', 'protected-set-method'],
          {
            group: ['private-static-property', 'private-static-accessor-property'],
            newlinesInside: 0,
          },
          ['private-static-get-method', 'private-static-set-method'],
          {
            group: ['private-decorated-property', 'private-decorated-accessor-property'],
            newlinesInside: 1,
          },
          { group: ['private-property', 'private-accessor-property'], newlinesInside: 0 },
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
