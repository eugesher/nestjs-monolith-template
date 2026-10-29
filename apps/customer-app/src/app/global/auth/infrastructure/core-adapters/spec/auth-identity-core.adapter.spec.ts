import { AuthIdentityCoreAdapter } from '../auth-identity-core.adapter';

describe('AuthIdentityCoreAdapter', () => {
  let validateSubject: jest.Mock;
  let adapter: AuthIdentityCoreAdapter;

  beforeEach(() => {
    validateSubject = jest.fn();
    adapter = new AuthIdentityCoreAdapter({
      login: jest.fn(),
      refreshToken: jest.fn(),
      validateSubject,
    });
  });

  describe('findSubject', () => {
    it('asks identity for the subject of the token and answers it as the current user', async () => {
      validateSubject.mockResolvedValue({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
        permissions: ['item:archive'],
      });

      const user = await adapter.findSubject({ sub: 'user-1' });

      expect(user).toEqual({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
        permissions: ['item:archive'],
      });
      expect(validateSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('answers no user when identity knows no active subject', async () => {
      validateSubject.mockResolvedValue(undefined);

      const user = await adapter.findSubject({ sub: 'user-1' });

      expect(user).toBeUndefined();
    });
  });
});
