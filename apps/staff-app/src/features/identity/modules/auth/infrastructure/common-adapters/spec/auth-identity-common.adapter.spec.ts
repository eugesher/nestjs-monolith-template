import { AuthIdentityCommonAdapter } from '../auth-identity-common.adapter';

describe('AuthIdentityCommonAdapter', () => {
  let validateSubject: jest.Mock;
  let adapter: AuthIdentityCommonAdapter;

  beforeEach(() => {
    validateSubject = jest.fn();
    adapter = new AuthIdentityCommonAdapter({ validateSubject });
  });

  describe('findSubject', () => {
    it('answers the subject the common auth module re-derives for the user', async () => {
      validateSubject.mockResolvedValue({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
      });

      const subject = await adapter.findSubject({ userId: 'user-1' });

      expect(subject).toEqual({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });
      expect(validateSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });
});
