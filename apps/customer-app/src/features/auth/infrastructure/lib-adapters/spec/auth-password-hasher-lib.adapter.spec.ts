import { AuthPasswordHasherLibAdapter } from '../auth-password-hasher-lib.adapter';

describe('AuthPasswordHasherLibAdapter', () => {
  let hashPassword: jest.Mock;
  let verifyPassword: jest.Mock;
  let adapter: AuthPasswordHasherLibAdapter;

  beforeEach(() => {
    hashPassword = jest.fn();
    verifyPassword = jest.fn();
    adapter = new AuthPasswordHasherLibAdapter({
      signAccessToken: jest.fn(),
      hashPassword,
      verifyPassword,
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
