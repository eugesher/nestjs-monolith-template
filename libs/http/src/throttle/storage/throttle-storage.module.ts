import { Module } from '@nestjs/common';

import { ThrottleRedisStorage } from './throttle-redis.storage';

@Module({
  exports: [ThrottleRedisStorage],
  providers: [ThrottleRedisStorage],
})
export class ThrottleStorageModule {}
