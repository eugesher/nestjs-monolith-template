import type { INestApplication } from '@nestjs/common';
import type { Redis } from 'ioredis';

import { CACHE_LIB_REDIS_CLIENT_TOKEN } from '@acme-libs/testing/cache';
import { E2EContext } from '@acme-libs/testing/e2e/e2e.context';
import { AppModule } from '@acme-customer/app/app.module';
import { AppModule as ProcessorAppModule } from '@acme-processor/app/app.module';
import type { Maybe } from '@acme-libs/toolkit';

interface IAppE2EState {
  processor: INestApplication;
  redis: Redis;
  annToken: string;
}

export class AppE2EContext extends E2EContext {
  public get redis(): Redis {
    return this.started.redis;
  }

  public get annToken(): string {
    return this.started.annToken;
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

  constructor() {
    super(AppModule);
  }

  public override async init(): Promise<void> {
    const processorFixture = await AppE2EContext.compile(ProcessorAppModule);
    const processor = await AppE2EContext.start(processorFixture);

    await super.init();

    const redis = this.moduleFixture.get<Redis>(CACHE_LIB_REDIS_CLIENT_TOKEN);
    const annToken = this.jwt.sign({ sub: '101' });

    this.state = { processor, redis, annToken };
  }

  public override async close(): Promise<void> {
    await this.started.processor.close();
    await super.close();
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

  private static async delay(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, AppE2EContext.POLL_INTERVAL_MS));
  }
}
