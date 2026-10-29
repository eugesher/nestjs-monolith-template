import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Redis } from 'ioredis';
import { Logger, PinoLogger } from 'nestjs-pino';
import { DataSource } from 'typeorm';

import { AppModule } from '@acme-customer-app';
import { REDIS_CLIENT } from '@acme-libs/cache/testing';
import { Maybe } from '@acme-libs/toolkit';

interface IAppE2EState {
  app: INestApplication;
  moduleFixture: TestingModule;
  dataSource: DataSource;
  rootLoggerWarn: jest.SpiedFunction<PinoLogger['warn']>;
  redis: Redis;
  jwt: JwtService;
  annToken: string;
  bobToken: string;
  carolToken: string;
}

export class AppE2EContext {
  private state: Maybe<IAppE2EState>;

  public get app(): INestApplication {
    return this.started.app;
  }

  public get moduleFixture(): TestingModule {
    return this.started.moduleFixture;
  }

  public get dataSource(): DataSource {
    return this.started.dataSource;
  }

  public get redis(): Redis {
    return this.started.redis;
  }

  public get jwt(): JwtService {
    return this.started.jwt;
  }

  public get annToken(): string {
    return this.started.annToken;
  }

  public get bobToken(): string {
    return this.started.bobToken;
  }

  public get carolToken(): string {
    return this.started.carolToken;
  }

  public async init(): Promise<void> {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const dataSource = moduleFixture.get(DataSource);
    const redis = moduleFixture.get<Redis>(REDIS_CLIENT);
    const config = moduleFixture.get(ConfigService);
    const secret = config.getOrThrow<string>('JWT_SECRET');
    const prefix = config.getOrThrow<string>('API_PREFIX');
    const jwt = new JwtService({ secret });
    const app = moduleFixture.createNestApplication({ bufferLogs: true });
    const appLogger = app.get(Logger);

    app.useLogger(appLogger);
    app.setGlobalPrefix(prefix);

    await app.init();

    const rootLoggerWarn = jest.spyOn(PinoLogger.root, 'warn');
    const annToken = jwt.sign({ sub: '00000000-0000-4000-8000-000000000101' });
    const bobToken = jwt.sign({ sub: '00000000-0000-4000-8000-000000000102' });
    const carolToken = jwt.sign({ sub: '00000000-0000-4000-8000-000000000103' });

    this.state = {
      app,
      moduleFixture,
      dataSource,
      rootLoggerWarn,
      redis,
      jwt,
      annToken,
      bobToken,
      carolToken,
    };
  }

  public close(): Promise<void> {
    return this.app.close();
  }

  public takeRootWarnings(): unknown[][] {
    const { calls, contexts } = this.started.rootLoggerWarn.mock;
    const warnings = calls.filter((_, index) => contexts[index] === PinoLogger.root);

    this.started.rootLoggerWarn.mockClear();

    return warnings;
  }

  private get started(): IAppE2EState {
    if (!this.state) {
      throw new Error('AppE2EContext is read before init(): use it inside it() and hooks');
    }

    return this.state;
  }
}
