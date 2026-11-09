process.env.TZ = 'America/New_York';

const dotenv = require('dotenv');
const path = require('path');
const tsconfig = require('../tsconfig.json');

const repoRoot = path.join(__dirname, '..');

const moduleNameMapper = Object.fromEntries(
  Object.entries(tsconfig.compilerOptions.paths).map(([alias, [target]]) => [
    `^${alias.replace('/*', '/(.*)')}$`,
    path.join(repoRoot, target.replace('/*', '/$1')),
  ]),
);

module.exports = (app) => {
  const envFile = path.join(repoRoot, 'env', 'apps', app, '.env.test');

  dotenv.config({ path: envFile, override: true, quiet: true });

  return {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: path.join(repoRoot, 'apps', app),
    testEnvironment: 'node',
    setupFiles: ['reflect-metadata'],
    testRegex: '\\.e2e-spec\\.ts$',
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    moduleNameMapper,
  };
};
