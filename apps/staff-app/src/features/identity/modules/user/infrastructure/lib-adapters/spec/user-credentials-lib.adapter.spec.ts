import { UserCredentialsLibAdapter } from '../user-credentials-lib.adapter';

describe('UserCredentialsLibAdapter', () => {
  let hashPassword: jest.Mock;
  let adapter: UserCredentialsLibAdapter;

  beforeEach(() => {
    hashPassword = jest.fn();
    adapter = new UserCredentialsLibAdapter({
      signAccessToken: jest.fn(),
      hashPassword,
      verifyPassword: jest.fn(),
    });
  });

  describe('hashPassword', () => {
    it('hashes the password with the credentials lib', async () => {
      hashPassword.mockResolvedValue('argon-hash');

      const passwordHash = await adapter.hashPassword('correct-horse-battery');

      expect(passwordHash).toBe('argon-hash');
      expect(hashPassword).toHaveBeenCalledWith('correct-horse-battery');
    });
  });
});
