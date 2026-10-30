import { BullModule, BullRootModuleOptions } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): BullRootModuleOptions => ({
        url: config.getOrThrow<string>('REDIS_URL'),
        defaultJobOptions: { removeOnComplete: true },
      }),
    }),
  ],
})
export class QueueSetupModule {}
