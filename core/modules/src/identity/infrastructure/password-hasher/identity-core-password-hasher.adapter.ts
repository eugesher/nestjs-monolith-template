import { Inject, Injectable } from '@nestjs/common';
import { argon2id, hash, verify } from 'argon2';

import {
  IDENTITY_CORE_PASSWORD_HASHER_MEMORY_COST,
  IDENTITY_CORE_PASSWORD_HASHER_PARALLELISM,
  IDENTITY_CORE_PASSWORD_HASHER_TIME_COST,
  IIdentityCorePasswordHasherPort,
} from '../../outbound';

@Injectable()
export class IdentityCorePasswordHasherAdapter implements IIdentityCorePasswordHasherPort {
  constructor(
    @Inject(IDENTITY_CORE_PASSWORD_HASHER_MEMORY_COST)
    private readonly memoryCost: number,
    @Inject(IDENTITY_CORE_PASSWORD_HASHER_PARALLELISM)
    private readonly parallelism: number,
    @Inject(IDENTITY_CORE_PASSWORD_HASHER_TIME_COST)
    private readonly timeCost: number,
  ) {}

  public hash(password: string): Promise<string> {
    return hash(password, {
      type: argon2id,
      memoryCost: this.memoryCost,
      parallelism: this.parallelism,
      timeCost: this.timeCost,
    });
  }

  public async verify(passwordHash: string, password: string): Promise<boolean> {
    try {
      return await verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}
