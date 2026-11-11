import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Logger, PinoLogger } from 'nestjs-pino';
import { DataSource } from 'typeorm';
import type { INestApplication, Type } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';

import type { Maybe } from '@acme-libs/toolkit';

interface IE2EContextState {
  app: INestApplication;
  moduleFixture: TestingModule;
  dataSource: DataSource;
  jwt: JwtService;
  rootLoggerWarn: jest.SpiedFunction<PinoLogger['warn']>;
}

export class E2EContext {
  public get app(): INestApplication {
    return this.initialized.app;
  }

  public get moduleFixture(): TestingModule {
    return this.initialized.moduleFixture;
  }

  public get dataSource(): DataSource {
    return this.initialized.dataSource;
  }

  public get jwt(): JwtService {
    return this.initialized.jwt;
  }

  private context: Maybe<IE2EContextState>;

  private get initialized(): IE2EContextState {
    if (!this.context) {
      throw new Error('The e2e context is read before init(): use it inside it() and hooks');
    }

    return this.context;
  }

  constructor(private readonly appModule: Type<unknown>) {}

  public async init(): Promise<void> {
    const moduleFixture = await E2EContext.compile(this.appModule);
    const dataSource = moduleFixture.get(DataSource);
    const config = moduleFixture.get(ConfigService);
    const secret = config.getOrThrow<string>('JWT_SECRET');
    const jwt = new JwtService({ secret });
    const app = await E2EContext.start(moduleFixture);
    const rootLoggerWarn = jest.spyOn(PinoLogger.root, 'warn');

    this.context = { app, moduleFixture, dataSource, jwt, rootLoggerWarn };
  }

  public async close(): Promise<void> {
    await this.app.close();
  }

  public takeRootWarnings(): unknown[][] {
    const { calls, contexts } = this.initialized.rootLoggerWarn.mock;
    const warnings = calls.filter((_, index) => contexts[index] === PinoLogger.root);

    this.initialized.rootLoggerWarn.mockClear();

    return warnings;
  }

  protected static async compile(appModule: Type<unknown>): Promise<TestingModule> {
    return await Test.createTestingModule({ imports: [appModule] }).compile();
  }

  protected static async start(moduleFixture: TestingModule): Promise<INestApplication> {
    const app = moduleFixture.createNestApplication({ bufferLogs: true });
    const config = app.get(ConfigService);
    const prefix = config.getOrThrow<string>('API_PREFIX');
    const logger = app.get(Logger);

    app.useLogger(logger);
    app.setGlobalPrefix(prefix);

    await app.init();

    return app;
  }
}
