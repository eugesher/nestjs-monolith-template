import { AuthGlobalStaffIdentityCommonAdapter } from '../../infrastructure';
import { AuthGlobalClaimsFacade } from '../auth-global-claims.facade';

describe('AuthGlobalClaimsFacade', () => {
  let findRoles: jest.Mock;
  let findPermissionCodes: jest.Mock;
  let facade: AuthGlobalClaimsFacade;

  beforeEach(() => {
    findRoles = jest.fn();
    findPermissionCodes = jest.fn();
    facade = new AuthGlobalClaimsFacade({
      findRoles,
      findPermissionCodes,
    } as unknown as AuthGlobalStaffIdentityCommonAdapter);
  });

  describe('findRoles', () => {
    it('answers the roles identity reads for the user', async () => {
      findRoles.mockResolvedValue(['viewer']);

      const roles = await facade.findRoles({ userId: 'user-1' });

      expect(roles).toEqual(['viewer']);
      expect(findRoles).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });

  describe('findPermissionCodes', () => {
    it('answers the permission codes identity reads for the user', async () => {
      findPermissionCodes.mockResolvedValue(['product:read']);

      const codes = await facade.findPermissionCodes({ userId: 'user-1' });

      expect(codes).toEqual(['product:read']);
      expect(findPermissionCodes).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });
});
