import { getQueueToken } from '@nestjs/bull';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import type { Queue } from 'bull';
import { Logger, PinoLogger } from 'nestjs-pino';
import { DataSource } from 'typeorm';

import { AppModule } from '@acme-processor-app';
import {
  type ILedgerRecordProcessorPayload,
  LEDGER_RECORD_QUEUE,
} from '@acme-core/contracts/ledger';
import { Maybe } from '@acme-libs/toolkit';

interface IAppE2EState {
  app: INestApplication;
  moduleFixture: TestingModule;
  dataSource: DataSource;
  ledgerRecordQueue: Queue<ILedgerRecordProcessorPayload>;
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

  public async init(): Promise<void> {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const dataSource = moduleFixture.get(DataSource);
    const ledgerRecordQueue = moduleFixture.get<Queue<ILedgerRecordProcessorPayload>>(
      getQueueToken(LEDGER_RECORD_QUEUE),
    );
    const config = moduleFixture.get(ConfigService);
    const prefix = config.getOrThrow<string>('API_PREFIX');
    const app = moduleFixture.createNestApplication({ bufferLogs: true });
    const appLogger = app.get(Logger);

    app.useLogger(appLogger);
    app.setGlobalPrefix(prefix);

    await app.init();

    const rootLoggerWarn = jest.spyOn(PinoLogger.root, 'warn');

    this.state = { app, moduleFixture, dataSource, ledgerRecordQueue, rootLoggerWarn };
  }

  public close(): Promise<void> {
    return this.app.close();
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
