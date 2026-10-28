import { IdentityCorePasswordHasherAdapter } from '../identity-core-password-hasher.adapter';

describe('IdentityCorePasswordHasherAdapter', () => {
  let adapter: IdentityCorePasswordHasherAdapter;

  beforeEach(() => {
    adapter = new IdentityCorePasswordHasherAdapter(1024, 1, 2);
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
