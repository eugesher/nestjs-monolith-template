import { baseLibs, from, fromLib, libContracts, libs, own, packages, to } from './selectors.mjs';

export const acmeLibs = [
  from('acme-libs', [to('acme-libs', own('lib')), to('acme-libs:contracts', own('lib'))]),
  from('acme-libs:contracts', [to('acme-libs:contracts', own('lib')), baseLibs()]),
  fromLib(
    [
      'auth',
      'cache',
      'config',
      'database',
      'health',
      'http',
      'messaging',
      'observability',
      'openapi',
    ],
    [baseLibs()],
  ),
  fromLib('auth', [packages('@nestjs/common', '@nestjs/config', '@nestjs/core', '@nestjs/jwt')]),
  fromLib('cache', [
    libs('observability'),
    packages(
      '@nestjs/common',
      '@nestjs/config',
      '@nestjs/core',
      '@opentelemetry/api',
      'ioredis',
      'nestjs-pino',
    ),
  ]),
  fromLib('health', [
    libs('observability'),
    libContracts('cache'),
    packages('@nestjs/common', '@nestjs/core', 'nestjs-pino', 'typeorm'),
  ]),
  fromLib('http', [
    libs('database', 'observability'),
    packages(
      '@nestjs/common',
      '@nestjs/core',
      'class-transformer',
      'class-validator',
      'nestjs-pino',
      'typeorm',
    ),
  ]),
  fromLib('openapi', [
    packages('@nestjs/common', '@nestjs/config', '@nestjs/swagger', '@scalar/nestjs-api-reference'),
  ]),
  fromLib('messaging', [
    libs('observability'),
    packages('@nestjs/common', '@nestjs/core', '@nestjs/event-emitter', 'nestjs-pino'),
  ]),
  fromLib('observability', [libs('config')]),
  fromLib('config', [packages('@nestjs/common', '@nestjs/config')]),
  fromLib('database', [
    packages(
      '@nestjs-cls/transactional',
      '@nestjs-cls/transactional-adapter-typeorm',
      '@nestjs/common',
      '@nestjs/core',
      'nestjs-cls',
      'typeorm',
    ),
  ]),
  fromLib('observability', [
    packages(
      '@nestjs/common',
      '@opentelemetry/api',
      '@opentelemetry/auto-instrumentations-node',
      '@opentelemetry/exporter-trace-otlp-http',
      '@opentelemetry/resources',
      '@opentelemetry/sdk-node',
      '@opentelemetry/semantic-conventions',
      'async_hooks',
      'crypto',
      'http',
      'nestjs-pino',
      'pino',
      'pino-http',
    ),
  ]),
  fromLib('toolkit', [packages('crypto')]),
];
