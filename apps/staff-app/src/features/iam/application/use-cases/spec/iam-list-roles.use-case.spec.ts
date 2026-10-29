import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IamListRolesUseCase } from '../iam-list-roles.use-case';

describe('IamListRolesUseCase', () => {
  let listRoles: jest.Mock;
  let useCase: IamListRolesUseCase;

  beforeEach(() => {
    listRoles = jest.fn();
    useCase = new IamListRolesUseCase({
      registerUser: jest.fn(),
      assignRole: jest.fn(),
      listRoles,
      updateRolePermissions: jest.fn(),
    });
  });

  describe('execute', () => {
    it('answers the roles of identity with the permissions they grant', async () => {
      listRoles.mockResolvedValue([
        { name: RoleEnum.ADMIN, permissionCodes: [PermissionCodeEnum.IAM_ASSIGN] },
        { name: RoleEnum.VIEWER, permissionCodes: [] },
      ]);

      const roles = await useCase.execute();

      expect(roles).toEqual([
        { name: 'admin', permissionCodes: ['iam:assign'] },
        { name: 'viewer', permissionCodes: [] },
      ]);
    });
  });
});
