import { getQueueToken } from '@nestjs/bull';
import type { Queue } from 'bull';
import type { Redis } from 'ioredis';

import { CACHE_LIB_REDIS_CLIENT_TOKEN } from '@acme-libs/testing';
import { E2EContext } from '@acme-libs/testing';
import {
  LEDGER_RECORD_QUEUE,
  type ILedgerRecordProcessorPayload,
} from '@acme-libs/contracts/ledger';
import { AppModule } from '@acme-staff/app/app.module';
import type { Maybe } from '@acme-libs/toolkit';

interface IAppE2EState {
  redis: Redis;
  adminToken: string;
  editorToken: string;
  viewerToken: string;
}

export class AppE2EContext extends E2EContext {
  public get redis(): Redis {
    return this.started.redis;
  }

  public get adminToken(): string {
    return this.started.adminToken;
  }

  public get editorToken(): string {
    return this.started.editorToken;
  }

  public get viewerToken(): string {
    return this.started.viewerToken;
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
    const adminToken = this.jwt.sign({ sub: '1' });
    const editorToken = this.jwt.sign({ sub: '2' });
    const viewerToken = this.jwt.sign({ sub: '3' });

    this.state = { redis, adminToken, editorToken, viewerToken };
  }

  public async takeLedgerRecords(): Promise<ILedgerRecordProcessorPayload[]> {
    const queue = this.moduleFixture.get<Queue<ILedgerRecordProcessorPayload>>(
      getQueueToken(LEDGER_RECORD_QUEUE),
    );
    const jobs = await queue.getWaiting();

    await queue.empty();

    return jobs.map((job) => job.data);
  }
}
