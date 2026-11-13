import { getQueueToken } from '@nestjs/bull';
import { SchedulerRegistry } from '@nestjs/schedule';
import type { Queue } from 'bull';

import { AuthAudienceEnum } from '@acme-libs/kernel';
import { E2EContext } from '@acme-libs/testing';
import {
  LEDGER_RECORD_QUEUE,
  type ILedgerRecordProcessorPayload,
} from '@acme-core/contracts/ledger';
import {
  PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
  type IProductStockPostSubtractPayload,
} from '@acme-core/contracts/product-stock';
import { AppModule } from '@acme-processor/app/app.module';
import type { Maybe } from '@acme-libs/toolkit';

interface IAppE2EState {
  ledgerRecordQueue: Queue<ILedgerRecordProcessorPayload>;
  postSubtractQueue: Queue<IProductStockPostSubtractPayload>;
  adminToken: string;
  viewerToken: string;
}

export class AppE2EContext extends E2EContext {
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

  private static readonly POLL_INTERVAL_MS = 100;
  private static readonly POLL_ATTEMPTS = 100;

  private state: Maybe<IAppE2EState>;

  private get started(): IAppE2EState {
    if (!this.state) {
      throw new Error('AppE2EContext is read before init(): use it inside it() and hooks');
    }

    return this.state;
  }

  constructor() {
    super(AppModule, AuthAudienceEnum.STAFF);
  }

  public override async init(): Promise<void> {
    await super.init();

    const ledgerRecordQueue = this.moduleFixture.get<Queue<ILedgerRecordProcessorPayload>>(
      getQueueToken(LEDGER_RECORD_QUEUE),
    );
    const postSubtractQueue = this.moduleFixture.get<Queue<IProductStockPostSubtractPayload>>(
      getQueueToken(PRODUCT_STOCK_POST_SUBTRACT_QUEUE),
    );
    const adminToken = this.jwt.sign({ sub: '1' });
    const viewerToken = this.jwt.sign({ sub: '3' });

    this.state = { ledgerRecordQueue, postSubtractQueue, adminToken, viewerToken };
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
}
