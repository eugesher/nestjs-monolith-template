import { AuthGlobalSubjectCoreAdapter } from '../auth-global-subject-core.adapter';

describe('AuthGlobalSubjectCoreAdapter', () => {
  let findSubject: jest.Mock;
  let adapter: AuthGlobalSubjectCoreAdapter;

  beforeEach(() => {
    findSubject = jest.fn();
    adapter = new AuthGlobalSubjectCoreAdapter({ findSubject, findByEmail: jest.fn() });
  });

  describe('findSubject', () => {
    it('answers the subject the core staff auth module finds for the user', async () => {
      findSubject.mockResolvedValue({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
        permissionCodes: ['ledger:read'],
      });

      const subject = await adapter.findSubject({ userId: 'user-1' });

      expect(subject).toEqual({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
        permissionCodes: ['ledger:read'],
      });
      expect(findSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });
});
