import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Logger, PinoLogger } from 'nestjs-pino';
import { DataSource } from 'typeorm';
import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import type { Redis } from 'ioredis';

import { CACHE_LIB_REDIS_CLIENT_TOKEN } from '@acme-libs/cache/testing';
import { AppModule as ProcessorAppModule } from '@acme-processor/app/app.module';
import { AppModule } from '@acme-staff/app/app.module';
import type { Maybe } from '@acme-libs/toolkit';

interface IAppE2EState {
  app: INestApplication;
  processor: INestApplication;
  dataSource: DataSource;
  rootLoggerWarn: jest.SpiedFunction<PinoLogger['warn']>;
  redis: Redis;
  editorToken: string;
}

export class AppE2EContext {
  public get app(): INestApplication {
    return this.started.app;
  }

  public get dataSource(): DataSource {
    return this.started.dataSource;
  }

  public get redis(): Redis {
    return this.started.redis;
  }

  public get editorToken(): string {
    return this.started.editorToken;
  }

  private static readonly POLL_INTERVAL_MS = 500;
  private static readonly POLL_ATTEMPTS = 30;

  private state: Maybe<IAppE2EState>;

  private get started(): IAppE2EState {
    if (!this.state) {
      throw new Error('AppE2EContext is read before init(): use it inside it() and hooks');
    }

    return this.state;
  }

  public async init(): Promise<void> {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const processorFixture = await Test.createTestingModule({
      imports: [ProcessorAppModule],
    }).compile();
    const dataSource = moduleFixture.get(DataSource);
    const redis = moduleFixture.get<Redis>(CACHE_LIB_REDIS_CLIENT_TOKEN);
    const config = moduleFixture.get(ConfigService);
    const secret = config.getOrThrow<string>('JWT_SECRET');
    const jwt = new JwtService({ secret });
    const app = await AppE2EContext.start(moduleFixture);
    const processor = await AppE2EContext.start(processorFixture);
    const rootLoggerWarn = jest.spyOn(PinoLogger.root, 'warn');
    const editorToken = jwt.sign({ sub: '2' });

    this.state = { app, processor, dataSource, rootLoggerWarn, redis, editorToken };
  }

  public async close(): Promise<void> {
    await this.started.processor.close();
    await this.app.close();
  }

  public async pollUntil<T>(read: () => Promise<T>, isDone: (value: T) => boolean): Promise<T> {
    await AppE2EContext.delay();

    let value = await read();

    for (let attempt = 1; attempt < AppE2EContext.POLL_ATTEMPTS && !isDone(value); attempt++) {
      await AppE2EContext.delay();
      value = await read();
    }

    return value;
  }

  public takeRootWarnings(): unknown[][] {
    const { calls, contexts } = this.started.rootLoggerWarn.mock;
    const warnings = calls.filter((_, index) => contexts[index] === PinoLogger.root);

    this.started.rootLoggerWarn.mockClear();

    return warnings;
  }

  private static async start(fixture: TestingModule): Promise<INestApplication> {
    const app = fixture.createNestApplication({ bufferLogs: true });
    const config = app.get(ConfigService);
    const prefix = config.getOrThrow<string>('API_PREFIX');
    const logger = app.get(Logger);

    app.useLogger(logger);
    app.setGlobalPrefix(prefix);

    await app.init();

    return app;
  }

  private static async delay(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, AppE2EContext.POLL_INTERVAL_MS));
  }
}
