import { Global, INestApplicationContext, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import { DataSource } from 'typeorm';

import { CACHE_PORT } from '@acme-libs/contracts/cache';
import { HEALTH_LIB_PORT, IHealthLibPort } from '@acme-libs/contracts/health';
import { AppNameEnum } from '@acme-libs/kernel';
import { HealthLibModule } from '../health-lib.module';

describe('HealthLibModule', () => {
  let context: INestApplicationContext;
  let port: IHealthLibPort;

  beforeEach(async () => {
    @Global()
    @Module({
      providers: [
        { provide: DataSource, useValue: { query: () => Promise.resolve([{ 1: '1' }]) } },
        { provide: CACHE_PORT, useValue: { get: () => Promise.reject(new Error('down')) } },
      ],
      exports: [DataSource, CACHE_PORT],
    })
    class DependenciesModule {}

    @Module({
      imports: [
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
        DependenciesModule,
        HealthLibModule.forRoot(AppNameEnum.ADMIN_API),
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
    const view = port.liveness();

    expect(view).toEqual({
      status: 'ok',
      app: 'admin-api',
      uptimeSeconds: expect.any(Number) as number,
    });
  });

  it('answers readiness from the real probes', async () => {
    const view = await port.readiness();

    expect(view).toEqual({
      status: 'not-ready',
      dependencies: {
        database: { status: 'ok', latencyMs: expect.any(Number) as number },
        cache: { status: 'error' },
      },
    });
  });
});
