import { AuthCredentialsLibAdapter } from '../auth-credentials-lib.adapter';

describe('AuthCredentialsLibAdapter', () => {
  let signAccessToken: jest.Mock;
  let hashPassword: jest.Mock;
  let verifyPassword: jest.Mock;
  let adapter: AuthCredentialsLibAdapter;

  beforeEach(() => {
    signAccessToken = jest.fn();
    hashPassword = jest.fn();
    verifyPassword = jest.fn();
    adapter = new AuthCredentialsLibAdapter({ signAccessToken, hashPassword, verifyPassword });
  });

  describe('issueAccessToken', () => {
    it('signs a token whose subject is the customer', async () => {
      signAccessToken.mockResolvedValue('access-token');

      const accessToken = await adapter.issueAccessToken('customer-1');

      expect(accessToken).toBe('access-token');
      expect(signAccessToken).toHaveBeenCalledWith({ sub: 'customer-1' });
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

  describe('verifyPassword', () => {
    it('checks the password against its hash with the credentials lib', async () => {
      verifyPassword.mockResolvedValue(true);

      const valid = await adapter.verifyPassword({
        passwordHash: 'argon-hash',
        password: 'correct-horse',
      });

      expect(valid).toBe(true);
      expect(verifyPassword).toHaveBeenCalledWith({
        passwordHash: 'argon-hash',
        password: 'correct-horse',
      });
    });
  });
});
