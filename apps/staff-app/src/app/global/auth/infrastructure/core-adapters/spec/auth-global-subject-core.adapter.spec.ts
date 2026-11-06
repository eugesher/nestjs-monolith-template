import { AuthGlobalSubjectCoreAdapter } from '../auth-global-subject-core.adapter';

describe('AuthGlobalSubjectCoreAdapter', () => {
  let handleFindSubject: jest.Mock;
  let adapter: AuthGlobalSubjectCoreAdapter;

  beforeEach(() => {
    handleFindSubject = jest.fn();
    adapter = new AuthGlobalSubjectCoreAdapter({ handleFindSubject, handleFindByEmail: jest.fn() });
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

      expect(subject).toEqual({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
        permissionCodes: ['ledger:read'],
      });
      expect(handleFindSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });
});
