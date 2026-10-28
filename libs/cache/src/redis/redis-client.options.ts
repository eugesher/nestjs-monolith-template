import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export class RedisClientOptions implements RedisOptions {
  public readonly enableOfflineQueue = false;
  public readonly commandTimeout: number;

  constructor(config: ConfigService) {
    this.commandTimeout = config.getOrThrow<number>('REDIS_COMMAND_TIMEOUT_MS');
  }
}
