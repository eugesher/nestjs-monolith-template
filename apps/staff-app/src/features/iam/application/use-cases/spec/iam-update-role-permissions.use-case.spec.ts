import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IamUpdateRolePermissionsUseCase } from '../iam-update-role-permissions.use-case';

describe('IamUpdateRolePermissionsUseCase', () => {
  let updateRolePermissions: jest.Mock;
  let useCase: IamUpdateRolePermissionsUseCase;

  beforeEach(() => {
    updateRolePermissions = jest.fn();
    useCase = new IamUpdateRolePermissionsUseCase({
      registerUser: jest.fn(),
      assignRole: jest.fn(),
      listRoles: jest.fn(),
      updateRolePermissions,
    });
  });

  describe('execute', () => {
    it('replaces the permissions of the role through identity and answers the role', async () => {
      updateRolePermissions.mockResolvedValue({
        name: RoleEnum.VIEWER,
        permissionCodes: [PermissionCodeEnum.IAM_ASSIGN, PermissionCodeEnum.LEDGER_READ],
      });

      const role = await useCase.execute({
        role: RoleEnum.VIEWER,
        permissionCodes: [PermissionCodeEnum.IAM_ASSIGN, PermissionCodeEnum.LEDGER_READ],
      });

      expect(role).toEqual({ name: 'viewer', permissionCodes: ['iam:assign', 'ledger:read'] });
      expect(updateRolePermissions).toHaveBeenCalledWith({
        role: 'viewer',
        permissionCodes: ['iam:assign', 'ledger:read'],
      });
    });
  });
});
