import { AuthIdentityCoreAdapter } from '../auth-identity-core.adapter';

describe('AuthIdentityCoreAdapter', () => {
  let handleFindSubject: jest.Mock;
  let handleLogin: jest.Mock;
  let adapter: AuthIdentityCoreAdapter;

  beforeEach(() => {
    handleFindSubject = jest.fn();
    handleLogin = jest.fn();
    adapter = new AuthIdentityCoreAdapter({ handleFindSubject, handleLogin });
  });

  describe('findSubject', () => {
    it('answers the subject the core staff auth module finds for the user', async () => {
      handleFindSubject.mockResolvedValue({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
        permissionCodes: ['ledger:read'],
      });

      const subject = await adapter.findSubject({ userId: 'user-1' });

      expect(subject).toEqual({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });
      expect(handleFindSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('answers null when the core staff auth module finds no active user', async () => {
      handleFindSubject.mockResolvedValue(null);

      const subject = await adapter.findSubject({ userId: 'user-1' });

      expect(subject).toBeNull();
    });
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
