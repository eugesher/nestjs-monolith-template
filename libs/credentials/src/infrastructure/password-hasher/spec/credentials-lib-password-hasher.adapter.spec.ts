import { verify } from 'argon2';
import type { ConfigService } from '@nestjs/config';
import type * as Argon2 from 'argon2';

import { CredentialsLibPasswordHasherAdapter } from '../credentials-lib-password-hasher.adapter';

jest.mock('argon2', () => {
  const actual = jest.requireActual<typeof Argon2>('argon2');

  return { ...actual, verify: jest.fn(actual.verify) };
});

describe('CredentialsLibPasswordHasherAdapter', () => {
  let adapter: CredentialsLibPasswordHasherAdapter;

  beforeEach(() => {
    const values: Record<string, number> = {
      AUTH_ARGON2_MEMORY_COST: 1024,
      AUTH_ARGON2_PARALLELISM: 1,
      AUTH_ARGON2_TIME_COST: 2,
      AUTH_ARGON2_MAX_CONCURRENCY: 1,
      AUTH_ARGON2_QUEUE_TIMEOUT_MS: 1000,
    };
    const config = {
      getOrThrow: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;

    adapter = new CredentialsLibPasswordHasherAdapter(config);
  });

  describe('hash', () => {
    it('produces an argon2id hash with the configured costs', async () => {
      const passwordHash = await adapter.hash('correct-horse-battery');

      expect(passwordHash).toMatch(/^\$argon2id\$v=19\$m=1024,t=2,p=1\$/);
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

      const valid = await adapter.verify({ passwordHash, password: 'correct-horse-battery' });

      expect(valid).toBe(true);
    });

    it('rejects another password', async () => {
      const passwordHash = await adapter.hash('correct-horse-battery');

      const valid = await adapter.verify({ passwordHash, password: 'wrong-horse-battery' });

      expect(valid).toBe(false);
    });

    it('rejects a malformed hash instead of throwing', async () => {
      const valid = await adapter.verify({
        passwordHash: 'not-a-hash',
        password: 'correct-horse-battery',
      });

      expect(valid).toBe(false);
    });

    it('checks a missing hash against a dummy hash with the configured costs', async () => {
      const valid = await adapter.verify({ passwordHash: null, password: 'correct-horse-battery' });

      expect(valid).toBe(false);
      expect(verify).toHaveBeenLastCalledWith(
        expect.stringMatching(/^\$argon2id\$v=19\$m=1024,t=2,p=1\$/),
        'correct-horse-battery',
      );
    });

    it('rejects a missing hash even for the password of the dummy hash', async () => {
      const valid = await adapter.verify({
        passwordHash: null,
        password: 'dummy-password-of-an-unknown-user',
      });

      expect(valid).toBe(false);
    });
  });
});
