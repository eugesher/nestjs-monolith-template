import { getQueueToken } from '@nestjs/bull';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { Logger, PinoLogger } from 'nestjs-pino';
import { DataSource } from 'typeorm';

import { Maybe } from '@acme-libs/toolkit';
import { ILedgerRecordProcessorPayload, LEDGER_RECORD_QUEUE } from '@acme-core/contracts/ledger';
import {
  IProductStockPostSubtractPayload,
  PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
} from '@acme-core/contracts/product-stock';
import { AppModule } from '@acme-processor/app/app.module';

interface IAppE2EState {
  app: INestApplication;
  moduleFixture: TestingModule;
  dataSource: DataSource;
  ledgerRecordQueue: Queue<ILedgerRecordProcessorPayload>;
  postSubtractQueue: Queue<IProductStockPostSubtractPayload>;
  adminToken: string;
  viewerToken: string;
  rootLoggerWarn: jest.SpiedFunction<PinoLogger['warn']>;
}

export class AppE2EContext {
  private static readonly POLL_INTERVAL_MS = 100;
  private static readonly POLL_ATTEMPTS = 100;

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

  public get ledgerRecordQueue(): Queue<ILedgerRecordProcessorPayload> {
    return this.started.ledgerRecordQueue;
  }

  public get postSubtractQueue(): Queue<IProductStockPostSubtractPayload> {
    return this.started.postSubtractQueue;
  }

  public get adminToken(): string {
    return this.started.adminToken;
  }

  public get viewerToken(): string {
    return this.started.viewerToken;
  }

  public async init(): Promise<void> {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const dataSource = moduleFixture.get(DataSource);
    const ledgerRecordQueue = moduleFixture.get<Queue<ILedgerRecordProcessorPayload>>(
      getQueueToken(LEDGER_RECORD_QUEUE),
    );
    const postSubtractQueue = moduleFixture.get<Queue<IProductStockPostSubtractPayload>>(
      getQueueToken(PRODUCT_STOCK_POST_SUBTRACT_QUEUE),
    );
    const config = moduleFixture.get(ConfigService);
    const prefix = config.getOrThrow<string>('API_PREFIX');
    const secret = config.getOrThrow<string>('JWT_SECRET');
    const jwt = new JwtService({ secret });
    const app = moduleFixture.createNestApplication({ bufferLogs: true });
    const appLogger = app.get(Logger);

    app.useLogger(appLogger);
    app.setGlobalPrefix(prefix);

    await app.init();

    const adminToken = jwt.sign({ sub: '1' });
    const viewerToken = jwt.sign({ sub: '3' });
    const rootLoggerWarn = jest.spyOn(PinoLogger.root, 'warn');

    this.state = {
      app,
      moduleFixture,
      dataSource,
      ledgerRecordQueue,
      postSubtractQueue,
      adminToken,
      viewerToken,
      rootLoggerWarn,
    };
  }

  public async close(): Promise<void> {
    await this.app.close();
  }

  public fireSchedule(name: string): void {
    const job = this.moduleFixture.get(SchedulerRegistry).getCronJob(name);

    void job.fireOnTick();
  }

  public async waitFor(description: string, settled: () => Promise<boolean>): Promise<void> {
    for (let attempt = 1; attempt <= AppE2EContext.POLL_ATTEMPTS; attempt++) {
      if (await settled()) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, AppE2EContext.POLL_INTERVAL_MS));
    }

    throw new Error(`Timed out waiting for ${description}`);
  }

  public async waitForLedgerRecordQueue(): Promise<void> {
    await this.waitFor(`the ${LEDGER_RECORD_QUEUE} queue to drain`, async () => {
      const counts = await this.ledgerRecordQueue.getJobCounts();

      return counts.waiting + counts.active + counts.delayed === 0;
    });
  }

  public async waitForPostSubtractQueue(): Promise<void> {
    await this.waitFor(`the ${PRODUCT_STOCK_POST_SUBTRACT_QUEUE} queue to drain`, async () => {
      const counts = await this.postSubtractQueue.getJobCounts();

      return counts.waiting + counts.active + counts.delayed === 0;
    });
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
