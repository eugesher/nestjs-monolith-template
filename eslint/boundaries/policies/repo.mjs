import { from, packages, to } from '../selectors.mjs';

export const repo = [
  from('repo:spec', [
    to('repo:spec'),
    packages(
      'eslint',
      'eslint-import-resolver-typescript',
      'fs',
      'os',
      'path',
      'typescript',
      'typescript-eslint',
    ),
  ]),
  ...['repo:scripts', 'repo:migrations', 'repo:docker-compose'].map((category) =>
    from(category, [to(category)]),
  ),
];
