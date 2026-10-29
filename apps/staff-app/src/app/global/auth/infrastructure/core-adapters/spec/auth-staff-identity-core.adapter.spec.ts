import { AuthStaffIdentityCoreAdapter } from '../auth-staff-identity-core.adapter';

describe('AuthStaffIdentityCoreAdapter', () => {
  let validateSubject: jest.Mock;
  let findPermissionCodes: jest.Mock;
  let adapter: AuthStaffIdentityCoreAdapter;

  beforeEach(() => {
    validateSubject = jest.fn();
    findPermissionCodes = jest.fn();
    adapter = new AuthStaffIdentityCoreAdapter({
      login: jest.fn(),
      validateSubject,
      findPermissionCodes,
    });
  });

  describe('findSubject', () => {
    it('asks identity for the subject of the token and answers it as the current user', async () => {
      validateSubject.mockResolvedValue({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
      });

      const user = await adapter.findSubject({ sub: 'user-1' });

      expect(user).toEqual({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });
      expect(validateSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('answers no user when identity knows no active subject', async () => {
      validateSubject.mockResolvedValue(undefined);

      const user = await adapter.findSubject({ sub: 'user-1' });

      expect(user).toBeUndefined();
    });
  });

  describe('findPermissionCodes', () => {
    it('answers the permission codes identity reads for the user', async () => {
      findPermissionCodes.mockResolvedValue(['item:archive']);

      const codes = await adapter.findPermissionCodes({ userId: 'user-1' });

      expect(codes).toEqual(['item:archive']);
      expect(findPermissionCodes).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });
});
