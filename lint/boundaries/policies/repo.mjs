import { baseLibs, from, packages, to } from './selectors.mjs';

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
  from('repo:scripts', [
    to('repo:scripts'),
    packages('argon2', 'child_process', 'dotenv', 'fs', 'joi', 'os', 'path', 'typeorm'),
  ]),
  from('repo:system', [
    to('repo:system'),
    to('acme-app:app:module'),
    baseLibs('testing'),
    packages('@nestjs/common', 'ioredis', 'supertest'),
  ]),
  from('repo:test', [to('repo:test'), packages('dotenv', 'fs', 'joi', 'path', 'typeorm')]),
];
