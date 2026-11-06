import { UserCredentialsLibAdapter } from '../user-credentials-lib.adapter';

describe('UserCredentialsLibAdapter', () => {
  let handleHashPassword: jest.Mock;
  let adapter: UserCredentialsLibAdapter;

  beforeEach(() => {
    handleHashPassword = jest.fn();
    adapter = new UserCredentialsLibAdapter({
      handleSignAccessToken: jest.fn(),
      handleHashPassword,
      handleVerifyPassword: jest.fn(),
    });
  });

  describe('hashPassword', () => {
    it('hashes the password with the credentials lib', async () => {
      handleHashPassword.mockResolvedValue('argon-hash');

      const passwordHash = await adapter.hashPassword('correct-horse-battery');

      expect(passwordHash).toBe('argon-hash');
      expect(handleHashPassword).toHaveBeenCalledWith('correct-horse-battery');
    });
  });
});
