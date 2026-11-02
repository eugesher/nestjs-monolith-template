import { AuthPasswordHasherLibAdapter } from '../auth-password-hasher-lib.adapter';

describe('AuthPasswordHasherLibAdapter', () => {
  let verifyPassword: jest.Mock;
  let adapter: AuthPasswordHasherLibAdapter;

  beforeEach(() => {
    verifyPassword = jest.fn();
    adapter = new AuthPasswordHasherLibAdapter({
      signAccessToken: jest.fn(),
      hashPassword: jest.fn(),
      verifyPassword,
    });
  });

  describe('verify', () => {
    it('checks the password against its hash with the credentials lib', async () => {
      verifyPassword.mockResolvedValue(true);

      const valid = await adapter.verify({ passwordHash: 'argon-hash', password: 'correct-horse' });

      expect(valid).toBe(true);
      expect(verifyPassword).toHaveBeenCalledWith({
        passwordHash: 'argon-hash',
        password: 'correct-horse',
      });
    });
  });
});
