import { ConfigService } from '@nestjs/config';
import { argon2id } from 'argon2';

import { CredentialsPasswordHasherOptions } from '../credentials-password-hasher.options';

describe('CredentialsPasswordHasherOptions', () => {
  it('hashes with argon2id at the costs of AUTH_ARGON2_*', () => {
    const values: Record<string, number> = {
      AUTH_ARGON2_MEMORY_COST: 1024,
      AUTH_ARGON2_PARALLELISM: 1,
      AUTH_ARGON2_TIME_COST: 2,
    };
    const config = {
      getOrThrow: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;

    const options = new CredentialsPasswordHasherOptions(config);

    expect({ ...options }).toEqual({
      type: argon2id,
      memoryCost: 1024,
      parallelism: 1,
      timeCost: 2,
    });
  });
});
