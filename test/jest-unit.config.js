process.env.TZ = 'UTC';

const tsconfig = require('../tsconfig.json');

const moduleNameMapper = Object.fromEntries(
  Object.entries(tsconfig.compilerOptions.paths).map(([alias, [target]]) => [
    `^${alias.replace('/*', '/(.*)')}$`,
    `<rootDir>/${target.replace('/*', '/$1')}`,
  ]),
);

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../',
  testEnvironment: 'node',
  setupFiles: ['reflect-metadata'],
  testRegex: '\\.spec.ts$',
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.claude/'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper,
  coverageDirectory: 'coverage/unit',
  coverageReporters: ['text-summary', 'html'],
};
