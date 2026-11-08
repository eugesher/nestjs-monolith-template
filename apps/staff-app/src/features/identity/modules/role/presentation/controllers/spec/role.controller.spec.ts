import { PermissionCodeEnum } from '@acme-libs/kernel';

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
      list.mockResolvedValue([{ id: '3', name: 'viewer', permissionCodes: [] }]);

      const response = await controller.handleList();

      expect(response).toEqual([{ id: '3', name: 'viewer', permissionCodes: [] }]);
    });
  });

  describe('handleUpdatePermissions', () => {
    it('replaces the permissions of the role of the path with the codes of the body', async () => {
      updatePermissions.mockResolvedValue({
        id: '3',
        name: 'viewer',
        permissionCodes: [PermissionCodeEnum.IAM_ASSIGN],
      });

      const response = await controller.handleUpdatePermissions(
        { roleId: '3' },
        {
          permissionCodes: [PermissionCodeEnum.IAM_ASSIGN],
        },
      );

      expect(response).toEqual({ id: '3', name: 'viewer', permissionCodes: ['iam:assign'] });
      expect(updatePermissions).toHaveBeenCalledWith({
        roleId: '3',
        permissionCodes: ['iam:assign'],
      });
    });
  });
});
