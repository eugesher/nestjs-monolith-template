import { AuthIdentityCoreAdapter } from '../auth-identity-core.adapter';

describe('AuthIdentityCoreAdapter', () => {
  let handleLogin: jest.Mock;
  let adapter: AuthIdentityCoreAdapter;

  beforeEach(() => {
    handleLogin = jest.fn();
    adapter = new AuthIdentityCoreAdapter({ handleFindSubject: jest.fn(), handleLogin });
  });

  describe('login', () => {
    it('answers the login of the core staff auth module', async () => {
      handleLogin.mockResolvedValue({
        outcome: 'logged-in',
        userId: 'user-1',
        accessToken: 'access-token',
      });

      const view = await adapter.login({ email: 'ann@example.com', password: 'correct-horse' });

      expect(view).toEqual({ outcome: 'logged-in', userId: 'user-1', accessToken: 'access-token' });
      expect(handleLogin).toHaveBeenCalledWith({
        email: 'ann@example.com',
        password: 'correct-horse',
      });
    });

    it.each([
      ['invalid-credentials', undefined],
      ['user-inactive', 'user-1'],
    ])('maps the %s outcome', async (outcome, userId) => {
      handleLogin.mockResolvedValue({ outcome, userId, accessToken: undefined });

      const view = await adapter.login({ email: 'ann@example.com', password: 'wrong-horse' });

      expect(view).toEqual({ outcome, userId, accessToken: undefined });
    });
  });
});
