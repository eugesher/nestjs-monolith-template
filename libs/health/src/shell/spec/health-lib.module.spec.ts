import { Global, Module, type INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import { DataSource } from 'typeorm';

import { AppNameEnum } from '@acme-libs/kernel';
import { CACHE_LIB_PORT } from '@acme-libs/contracts/cache';
import { HEALTH_LIB_PORT, type IHealthLibPort } from '@acme-libs/contracts/health';

import { HealthLibModule } from '../health-lib.module';

describe('HealthLibModule', () => {
  let context: INestApplicationContext;
  let port: IHealthLibPort;

  beforeEach(async () => {
    @Global()
    @Module({
      exports: [DataSource, CACHE_LIB_PORT],
      providers: [
        { provide: DataSource, useValue: { query: () => Promise.resolve([{ 1: '1' }]) } },
        {
          provide: CACHE_LIB_PORT,
          useValue: { handleGet: () => Promise.reject(new Error('down')) },
        },
      ],
    })
    class DependenciesModule {}

    @Module({
      imports: [
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
        DependenciesModule,
        HealthLibModule.forRoot(AppNameEnum.STAFF_APP),
      ],
    })
    class TestModule {}

    context = await NestFactory.createApplicationContext(TestModule, { logger: false });
    port = context.get(HEALTH_LIB_PORT);
  });

  afterEach(async () => {
    await context.close();
    Object.assign(PinoLogger, { root: undefined });
  });

  it('answers liveness with the deployable it was given', () => {
    const view = port.handleLiveness();

    expect(view).toEqual({
      status: 'ok',
      app: 'staff-app',
      uptimeSeconds: expect.any(Number) as number,
    });
  });

  it('answers readiness from the real probes', async () => {
    const view = await port.handleReadiness();

    expect(view).toEqual({
      status: 'not-ready',
      app: 'staff-app',
      dependencies: {
        database: { status: 'ok', latencyMs: expect.any(Number) as number },
        cache: { status: 'error', latencyMs: null },
      },
    });
  });
});
