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
    '^.+\\.ts$': ['ts-jest', { tsconfig: { isolatedModules: false } }],
  },
  moduleNameMapper,
  coverageDirectory: 'coverage/unit',
  coverageReporters: ['text-summary', 'html'],
  collectCoverageFrom: [
    '{apps,core,libs}/**/*.ts',
    '!**/*.spec.ts',
    '!apps/*/test/**',
    '!libs/*/src/testing/**',
    '!**/index.ts',
    '!**/*.{port,token,enum,entity,dto,view,type,interface,const,command,query,record}.ts',
    '!**/*.module.ts',
    '!**/infrastructure/persistence/repositories/**',
    '!**/presentation/controllers/**',
    '!**/module/*.facade.ts',
    '!apps/*/src/main.ts',
    '!libs/observability/src/tracer/tracer.ts',
    '!libs/openapi/src/api-reference/api-reference.ts',
  ],
  coverageThreshold: {
    global: { statements: 95, branches: 95, functions: 95, lines: 95 },
    './{apps/*/src/{features,processors}/*,apps/*/src/features/*/modules/*,apps/*/src/common/modules/*,core/modules/src/*}/{domain,application}/**/*.ts':
      { statements: 95, branches: 95, functions: 95, lines: 95 },
    './{apps,core}/**/infrastructure/persistence/mappers/*.ts': {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
  },
};
