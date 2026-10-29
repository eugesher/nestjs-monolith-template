import { ConfigService } from '@nestjs/config';
import { argon2id, HashOptions } from 'argon2';

export class CredentialsPasswordHasherOptions implements HashOptions {
  public readonly type = argon2id;
  public readonly memoryCost: number;
  public readonly parallelism: number;
  public readonly timeCost: number;

  constructor(config: ConfigService) {
    this.memoryCost = config.getOrThrow<number>('AUTH_ARGON2_MEMORY_COST');
    this.parallelism = config.getOrThrow<number>('AUTH_ARGON2_PARALLELISM');
    this.timeCost = config.getOrThrow<number>('AUTH_ARGON2_TIME_COST');
  }
}
