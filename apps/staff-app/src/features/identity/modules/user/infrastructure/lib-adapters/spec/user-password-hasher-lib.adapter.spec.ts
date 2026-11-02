import { UserPasswordHasherLibAdapter } from '../user-password-hasher-lib.adapter';

describe('UserPasswordHasherLibAdapter', () => {
  let hashPassword: jest.Mock;
  let adapter: UserPasswordHasherLibAdapter;

  beforeEach(() => {
    hashPassword = jest.fn();
    adapter = new UserPasswordHasherLibAdapter({
      signAccessToken: jest.fn(),
      hashPassword,
      verifyPassword: jest.fn(),
    });
  });

  describe('hash', () => {
    it('hashes the password with the credentials lib', async () => {
      hashPassword.mockResolvedValue('argon-hash');

      const passwordHash = await adapter.hash('correct-horse-battery');

      expect(passwordHash).toBe('argon-hash');
      expect(hashPassword).toHaveBeenCalledWith('correct-horse-battery');
    });
  });
});
