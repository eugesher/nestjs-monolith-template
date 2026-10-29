import { AuthStaffIdentityCoreAdapter } from '../../infrastructure';
import { AuthClaimsFacade } from '../auth-claims.facade';

describe('AuthClaimsFacade', () => {
  let findRoles: jest.Mock;
  let findPermissionCodes: jest.Mock;
  let facade: AuthClaimsFacade;

  beforeEach(() => {
    findRoles = jest.fn();
    findPermissionCodes = jest.fn();
    facade = new AuthClaimsFacade({
      findRoles,
      findPermissionCodes,
    } as unknown as AuthStaffIdentityCoreAdapter);
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
      findPermissionCodes.mockResolvedValue(['note:read']);

      const codes = await facade.findPermissionCodes({ userId: 'user-1' });

      expect(codes).toEqual(['note:read']);
      expect(findPermissionCodes).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });
});
