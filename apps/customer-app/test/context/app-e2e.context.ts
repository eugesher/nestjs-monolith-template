import { getQueueToken } from '@nestjs/bull';
import type { Queue } from 'bull';
import type { Redis } from 'ioredis';

import { CACHE_LIB_REDIS_CLIENT_TOKEN } from '@acme-libs/testing';
import { E2EContext } from '@acme-libs/testing';
import {
  LEDGER_RECORD_QUEUE,
  type ILedgerRecordProcessorPayload,
} from '@acme-libs/contracts/ledger';
import {
  PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
  type IProductStockPostSubtractPayload,
} from '@acme-core/contracts/product-stock';
import { AppModule } from '@acme-customer/app/app.module';
import type { Maybe } from '@acme-libs/toolkit';

interface IAppE2EState {
  redis: Redis;
  annToken: string;
  bobToken: string;
  carolToken: string;
}

export class AppE2EContext extends E2EContext {
  public get redis(): Redis {
    return this.started.redis;
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

  private state: Maybe<IAppE2EState>;

  private get started(): IAppE2EState {
    if (!this.state) {
      throw new Error('AppE2EContext is read before init(): use it inside it() and hooks');
    }

    return this.state;
  }

  constructor() {
    super(AppModule);
  }

  public override async init(): Promise<void> {
    await super.init();

    const redis = this.moduleFixture.get<Redis>(CACHE_LIB_REDIS_CLIENT_TOKEN);
    const annToken = this.jwt.sign({ sub: '101' });
    const bobToken = this.jwt.sign({ sub: '102' });
    const carolToken = this.jwt.sign({ sub: '103' });

    this.state = { redis, annToken, bobToken, carolToken };
  }

  public async takeLedgerRecords(): Promise<ILedgerRecordProcessorPayload[]> {
    const queue = this.moduleFixture.get<Queue<ILedgerRecordProcessorPayload>>(
      getQueueToken(LEDGER_RECORD_QUEUE),
    );
    const jobs = await queue.getWaiting();

    await queue.empty();

    return jobs.map((job) => job.data);
  }

  public async takePostSubtractJobs(): Promise<IProductStockPostSubtractPayload[]> {
    const queue = this.moduleFixture.get<Queue<IProductStockPostSubtractPayload>>(
      getQueueToken(PRODUCT_STOCK_POST_SUBTRACT_QUEUE),
    );
    const jobs = await queue.getWaiting();

    await queue.empty();

    return jobs.map((job) => job.data);
  }
}
