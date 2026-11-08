import { BullModule, BullRootModuleOptions } from '@nestjs/bull';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
    const url = config.getOrThrow<string>('REDIS_URL');

    return { url, defaultJobOptions: BullSetupModule.DEFAULT_JOB_OPTIONS };
  }
}
