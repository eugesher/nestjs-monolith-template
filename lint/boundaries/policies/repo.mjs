import { from, packages, to } from './selectors.mjs';

export const repo = [
  from('repo:spec', [
    to('repo:spec'),
    packages(
      'child_process',
      'eslint',
      'eslint-import-resolver-typescript',
      'fs',
      'os',
      'path',
      'typescript',
      'typescript-eslint',
    ),
  ]),
  from('repo:migrations', [to('repo:migrations'), packages('dotenv', 'joi', 'path', 'typeorm')]),
  from('repo:scripts', [to('repo:scripts'), packages('fs', 'path')]),
  from('repo:docker-compose', [
    to('repo:docker-compose'),
    packages('fs', 'joi', 'path', 'typeorm'),
  ]),
];
