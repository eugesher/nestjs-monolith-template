import { PermissionCodeEnum } from '@acme-libs/kernel';

import { RoleListUseCase, RoleReassignPermissionsUseCase } from '../../../application';
import { RoleController } from '../role.controller';

describe('RoleController', () => {
  let list: jest.Mock;
  let reassignPermissions: jest.Mock;
  let controller: RoleController;

  beforeEach(() => {
    list = jest.fn();
    reassignPermissions = jest.fn();

    controller = new RoleController(
      { execute: list } as unknown as RoleListUseCase,
      { execute: reassignPermissions } as unknown as RoleReassignPermissionsUseCase,
    );
  });

  describe('handleList', () => {
    it('answers the roles', async () => {
      list.mockResolvedValue([{ id: '3', name: 'viewer', permissionCodes: [] }]);

      const response = await controller.handleList();

      expect(response).toEqual([{ id: '3', name: 'viewer', permissionCodes: [] }]);
    });
  });

  describe('handleReassignPermissions', () => {
    it('reassigns the permissions of the role of the path with the codes of the body', async () => {
      reassignPermissions.mockResolvedValue({
        id: '3',
        name: 'viewer',
        permissionCodes: [PermissionCodeEnum.IDENTITY_ROLE_ASSIGN],
      });

      const response = await controller.handleReassignPermissions(
        { roleId: '3' },
        {
          permissionCodes: [PermissionCodeEnum.IDENTITY_ROLE_ASSIGN],
        },
      );

      expect(response).toEqual({
        id: '3',
        name: 'viewer',
        permissionCodes: ['identity:role:assign'],
      });
      expect(reassignPermissions).toHaveBeenCalledWith({
        roleId: '3',
        permissionCodes: ['identity:role:assign'],
      });
    });
  });
});
