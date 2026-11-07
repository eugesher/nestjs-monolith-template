import { BullModule, BullRootModuleOptions } from '@nestjs/bull';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class BullSetupModule {
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
    const attempts = config.getOrThrow<number>('BULL_JOB_ATTEMPTS');
    const type = config.getOrThrow<string>('BULL_JOB_BACKOFF_TYPE');
    const delay = config.getOrThrow<number>('BULL_JOB_BACKOFF_DELAY');
    const removeOnComplete = config.getOrThrow<boolean>('BULL_AUTO_SWEEP');

    return { url, defaultJobOptions: { attempts, backoff: { type, delay }, removeOnComplete } };
  }
}
