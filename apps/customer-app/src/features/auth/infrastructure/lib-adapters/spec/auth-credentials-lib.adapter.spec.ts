import { AuthCredentialsLibAdapter } from '../auth-credentials-lib.adapter';

describe('AuthCredentialsLibAdapter', () => {
  let handleSignAccessToken: jest.Mock;
  let handleHashPassword: jest.Mock;
  let handleVerifyPassword: jest.Mock;
  let adapter: AuthCredentialsLibAdapter;

  beforeEach(() => {
    handleSignAccessToken = jest.fn();
    handleHashPassword = jest.fn();
    handleVerifyPassword = jest.fn();
    adapter = new AuthCredentialsLibAdapter({
      handleSignAccessToken,
      handleHashPassword,
      handleVerifyPassword,
    });
  });

  describe('issueAccessToken', () => {
    it('signs a token whose subject is the customer', async () => {
      handleSignAccessToken.mockResolvedValue('access-token');

      const accessToken = await adapter.issueAccessToken('customer-1');

      expect(accessToken).toBe('access-token');
      expect(handleSignAccessToken).toHaveBeenCalledWith({ sub: 'customer-1' });
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

  describe('verifyPassword', () => {
    it('checks the password against its hash with the credentials lib', async () => {
      handleVerifyPassword.mockResolvedValue(true);

      const valid = await adapter.verifyPassword({
        passwordHash: 'argon-hash',
        password: 'correct-horse',
      });

      expect(valid).toBe(true);
      expect(handleVerifyPassword).toHaveBeenCalledWith({
        passwordHash: 'argon-hash',
        password: 'correct-horse',
      });
    });
  });
});
