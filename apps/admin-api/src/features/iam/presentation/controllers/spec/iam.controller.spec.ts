import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import {
  IamAssignRoleUseCase,
  IamListRolesUseCase,
  IamRegisterUserUseCase,
  IamUpdateRolePermissionsUseCase,
} from '../../../application';
import { IamController } from '../iam.controller';

describe('IamController', () => {
  let registerUser: jest.Mock;
  let assignRole: jest.Mock;
  let listRoles: jest.Mock;
  let updateRolePermissions: jest.Mock;
  let controller: IamController;

  beforeEach(() => {
    registerUser = jest.fn();
    assignRole = jest.fn();
    listRoles = jest.fn();
    updateRolePermissions = jest.fn();

    const identity = { registerUser, assignRole, listRoles, updateRolePermissions };

    controller = new IamController(
      new IamRegisterUserUseCase(identity),
      new IamAssignRoleUseCase(identity),
      new IamListRolesUseCase(identity),
      new IamUpdateRolePermissionsUseCase(identity),
    );
  });

  describe('handleRegisterUser', () => {
    it('answers the registered user', async () => {
      registerUser.mockResolvedValue({ id: 'user-1', email: 'ann@example.com' });

      const response = await controller.handleRegisterUser({
        email: 'ann@example.com',
        password: 'long-enough-password',
        roles: [RoleEnum.EDITOR],
      });

      expect(response).toEqual({ id: 'user-1', email: 'ann@example.com' });
    });
  });

  describe('handleAssignRole', () => {
    it('grants the role of the body to the user of the path', async () => {
      assignRole.mockResolvedValue({ id: 'user-1', roles: [RoleEnum.VIEWER] });

      const response = await controller.handleAssignRole('user-1', { role: RoleEnum.VIEWER });

      expect(response).toEqual({ id: 'user-1', roles: ['viewer'] });
      expect(assignRole).toHaveBeenCalledWith({ userId: 'user-1', role: 'viewer' });
    });
  });

  describe('handleListRoles', () => {
    it('answers the roles', async () => {
      listRoles.mockResolvedValue([{ name: RoleEnum.VIEWER, permissionCodes: [] }]);

      const response = await controller.handleListRoles();

      expect(response).toEqual([{ name: 'viewer', permissionCodes: [] }]);
    });
  });

  describe('handleUpdateRolePermissions', () => {
    it('replaces the permissions of the role of the path with the codes of the body', async () => {
      updateRolePermissions.mockResolvedValue({
        name: RoleEnum.VIEWER,
        permissionCodes: [PermissionCodeEnum.ITEM_READ],
      });

      const response = await controller.handleUpdateRolePermissions(RoleEnum.VIEWER, {
        permissionCodes: [PermissionCodeEnum.ITEM_READ],
      });

      expect(response).toEqual({ name: 'viewer', permissionCodes: ['item:read'] });
      expect(updateRolePermissions).toHaveBeenCalledWith({
        role: 'viewer',
        permissionCodes: ['item:read'],
      });
    });
  });
});
