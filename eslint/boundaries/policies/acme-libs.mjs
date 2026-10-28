import { from, fromLib, libContracts, libs, own, packages, to } from '../selectors.mjs';

export const acmeLibs = [
  from('acme-libs', [to('acme-libs', own('lib')), to('acme-libs:contracts', own('lib'))]),
  from('acme-libs:contracts', [to('acme-libs:contracts', own('lib')), libs('kernel', 'toolkit')]),
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
    [libs('kernel', 'toolkit')],
  ),
  fromLib('cache', [
    libs('observability'),
    packages('@nestjs/common', '@nestjs/config', '@opentelemetry/api', 'ioredis', 'nestjs-pino'),
  ]),
  fromLib('health', [libs('observability'), libContracts('cache')]),
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
      'pino-http',
    ),
  ]),
  fromLib('toolkit', [packages('crypto')]),
];
