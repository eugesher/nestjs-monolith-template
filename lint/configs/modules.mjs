import perfectionist from 'eslint-plugin-perfectionist';

const keys = ['module', 'global', 'imports', 'exports', 'controllers', 'providers'];

export const modules = {
  files: ['**/*.ts'],
  plugins: { perfectionist },
  rules: {
    'perfectionist/sort-objects': [
      'error',
      {
        type: 'unsorted',
        useConfigurationIf: { allNamesMatchPattern: `^(${keys.join('|')})$` },
        customGroups: keys.map((key) => ({ groupName: key, elementNamePattern: `^${key}$` })),
        groups: keys,
      },
      { type: 'unsorted' },
    ],
  },
};
