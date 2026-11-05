import { AuthCredentialsLibAdapter } from '../auth-credentials-lib.adapter';

describe('AuthCredentialsLibAdapter', () => {
  let signAccessToken: jest.Mock;
  let verifyPassword: jest.Mock;
  let adapter: AuthCredentialsLibAdapter;

  beforeEach(() => {
    signAccessToken = jest.fn();
    verifyPassword = jest.fn();
    adapter = new AuthCredentialsLibAdapter({
      signAccessToken,
      hashPassword: jest.fn(),
      verifyPassword,
    });
  });

  describe('issueAccessToken', () => {
    it('signs a token whose subject is the user', async () => {
      signAccessToken.mockResolvedValue('access-token');

      const accessToken = await adapter.issueAccessToken('user-1');

      expect(accessToken).toBe('access-token');
      expect(signAccessToken).toHaveBeenCalledWith({ sub: 'user-1' });
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
