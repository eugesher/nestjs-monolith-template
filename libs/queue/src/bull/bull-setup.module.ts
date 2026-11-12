import { BullModule, type BullRootModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import type { DynamicModule } from '@nestjs/common';

import { TlsHelper } from '@acme-libs/config';

export class BullSetupModule {
  private static readonly DEFAULT_JOB_OPTIONS: BullRootModuleOptions['defaultJobOptions'] = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
  };

  public static forRoot(): DynamicModule {
    return BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): BullRootModuleOptions => BullSetupModule.options(config),
    });
  }

  public static registerQueue(name: string): DynamicModule {
    return BullModule.registerQueue({ name });
  }

  private static options(config: ConfigService): BullRootModuleOptions {
    const host = config.getOrThrow<string>('REDIS_HOST');
    const port = config.getOrThrow<number>('REDIS_PORT');
    const password = config.getOrThrow<string>('REDIS_PASSWORD');
    const caPath = config.getOrThrow<string>('REDIS_TLS_CA');
    const tls = TlsHelper.options(caPath);
    const redis = { host, port, password, tls };

    return { redis, defaultJobOptions: BullSetupModule.DEFAULT_JOB_OPTIONS };
  }
}
