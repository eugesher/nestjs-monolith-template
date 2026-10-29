import { ConfigService } from '@nestjs/config';

import { CredentialsPasswordHasherAdapter } from '../credentials-password-hasher.adapter';

describe('CredentialsPasswordHasherAdapter', () => {
  let adapter: CredentialsPasswordHasherAdapter;

  beforeEach(() => {
    const values: Record<string, number> = {
      AUTH_ARGON2_MEMORY_COST: 1024,
      AUTH_ARGON2_PARALLELISM: 1,
      AUTH_ARGON2_TIME_COST: 2,
    };
    const config = {
      getOrThrow: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;

    adapter = new CredentialsPasswordHasherAdapter(config);
  });

  describe('hash', () => {
    it('produces an argon2id hash with the configured costs', async () => {
      const passwordHash = await adapter.hash('correct-horse-battery');

      expect(passwordHash).toMatch(/^\$argon2id\$v=19\$m=1024,p=1,t=2\$/);
    });

    it('salts every hash', async () => {
      const first = await adapter.hash('correct-horse-battery');
      const second = await adapter.hash('correct-horse-battery');

      expect(first).not.toBe(second);
    });
  });

  describe('verify', () => {
    it('accepts the password of the hash', async () => {
      const passwordHash = await adapter.hash('correct-horse-battery');

      const valid = await adapter.verify(passwordHash, 'correct-horse-battery');

      expect(valid).toBe(true);
    });

    it('rejects another password', async () => {
      const passwordHash = await adapter.hash('correct-horse-battery');

      const valid = await adapter.verify(passwordHash, 'wrong-horse-battery');

      expect(valid).toBe(false);
    });

    it('rejects a malformed hash instead of throwing', async () => {
      const valid = await adapter.verify('not-a-hash', 'correct-horse-battery');

      expect(valid).toBe(false);
    });
  });
});
