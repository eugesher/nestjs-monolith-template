import {
  AuthGlobalFindPermissionCodesUseCase,
  AuthGlobalFindRolesUseCase,
} from '../../application';
import { AuthGlobalClaimsFacade } from '../auth-global-claims.facade';

describe('AuthGlobalClaimsFacade', () => {
  let findPermissionCodes: jest.Mock;
  let findSubject: jest.Mock;
  let facade: AuthGlobalClaimsFacade;

  beforeEach(() => {
    findPermissionCodes = jest.fn();
    findSubject = jest.fn();
    facade = new AuthGlobalClaimsFacade(
      new AuthGlobalFindPermissionCodesUseCase({ findPermissionCodes }),
      new AuthGlobalFindRolesUseCase({ findSubject }),
    );
  });

  describe('findRoles', () => {
    it('answers the roles the common auth module reads for the user', async () => {
      findSubject.mockResolvedValue({ id: 'user-1', email: 'ann@example.com', roles: ['viewer'] });

      const roles = await facade.findRoles({ userId: 'user-1' });

      expect(roles).toEqual(['viewer']);
      expect(findSubject).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findPermissionCodes', () => {
    it('answers the permission codes stored for the user', async () => {
      findPermissionCodes.mockResolvedValue(['product:read']);

      const codes = await facade.findPermissionCodes({ userId: 'user-1' });

      expect(codes).toEqual(['product:read']);
      expect(findPermissionCodes).toHaveBeenCalledWith('user-1');
    });
  });
});
