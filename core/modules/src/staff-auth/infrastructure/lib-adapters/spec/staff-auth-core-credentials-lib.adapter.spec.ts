import { StaffAuthCoreCredentialsLibAdapter } from '../staff-auth-core-credentials-lib.adapter';

describe('StaffAuthCoreCredentialsLibAdapter', () => {
  let handleSignAccessToken: jest.Mock;
  let handleVerifyPassword: jest.Mock;
  let adapter: StaffAuthCoreCredentialsLibAdapter;

  beforeEach(() => {
    handleSignAccessToken = jest.fn();
    handleVerifyPassword = jest.fn();
    adapter = new StaffAuthCoreCredentialsLibAdapter({
      handleSignAccessToken,
      handleHashPassword: jest.fn(),
      handleVerifyPassword,
    });
  });

  describe('issueAccessToken', () => {
    it('signs a token whose subject is the user', async () => {
      handleSignAccessToken.mockResolvedValue('access-token');

      const accessToken = await adapter.issueAccessToken('user-1');

      expect(accessToken).toBe('access-token');
      expect(handleSignAccessToken).toHaveBeenCalledWith({ sub: 'user-1' });
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
