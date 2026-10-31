import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { RoleListUseCase, RoleUpdatePermissionsUseCase } from '../../../application';
import { RoleController } from '../role.controller';

describe('RoleController', () => {
  let list: jest.Mock;
  let updatePermissions: jest.Mock;
  let controller: RoleController;

  beforeEach(() => {
    list = jest.fn();
    updatePermissions = jest.fn();

    controller = new RoleController(
      { execute: list } as unknown as RoleListUseCase,
      { execute: updatePermissions } as unknown as RoleUpdatePermissionsUseCase,
    );
  });

  describe('handleList', () => {
    it('answers the roles', async () => {
      list.mockResolvedValue([{ name: RoleEnum.VIEWER, permissionCodes: [] }]);

      const response = await controller.handleList();

      expect(response).toEqual([{ name: 'viewer', permissionCodes: [] }]);
    });
  });

  describe('handleUpdatePermissions', () => {
    it('replaces the permissions of the role of the path with the codes of the body', async () => {
      updatePermissions.mockResolvedValue({
        name: RoleEnum.VIEWER,
        permissionCodes: [PermissionCodeEnum.IAM_ASSIGN],
      });

      const response = await controller.handleUpdatePermissions(RoleEnum.VIEWER, {
        permissionCodes: [PermissionCodeEnum.IAM_ASSIGN],
      });

      expect(response).toEqual({ name: 'viewer', permissionCodes: ['iam:assign'] });
      expect(updatePermissions).toHaveBeenCalledWith({
        role: 'viewer',
        permissionCodes: ['iam:assign'],
      });
    });
  });
});
