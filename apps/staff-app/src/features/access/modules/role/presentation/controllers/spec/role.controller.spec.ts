import { PermissionCodeEnum } from '@acme-libs/kernel';

import { RoleController } from '../role.controller';
import type {
  RoleCreateUseCase,
  RoleListUseCase,
  RoleReassignPermissionsUseCase,
} from '../../../application';

describe('RoleController', () => {
  let list: jest.Mock;
  let create: jest.Mock;
  let reassignPermissions: jest.Mock;
  let controller: RoleController;

  beforeEach(() => {
    list = jest.fn();
    create = jest.fn();
    reassignPermissions = jest.fn();

    controller = new RoleController(
      { execute: list } as unknown as RoleListUseCase,
      { execute: create } as unknown as RoleCreateUseCase,
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

  describe('handleCreate', () => {
    it('creates the role from the body and answers it', async () => {
      create.mockResolvedValue({ id: '7', name: 'auditor', permissionCodes: [] });

      const response = await controller.handleCreate({ name: 'auditor', permissionCodes: [] });

      expect(response).toEqual({ id: '7', name: 'auditor', permissionCodes: [] });
      expect(create).toHaveBeenCalledWith({ name: 'auditor', permissionCodes: [] });
    });
  });

  describe('handleReassignPermissions', () => {
    it('reassigns the permissions of the role of the path with the codes of the body', async () => {
      reassignPermissions.mockResolvedValue({
        id: '3',
        name: 'viewer',
        permissionCodes: [PermissionCodeEnum.ACCESS_MANAGEMENT],
      });

      const response = await controller.handleReassignPermissions(
        { roleId: '3' },
        {
          permissionCodes: [PermissionCodeEnum.ACCESS_MANAGEMENT],
        },
      );

      expect(response).toEqual({
        id: '3',
        name: 'viewer',
        permissionCodes: ['access-management'],
      });
      expect(reassignPermissions).toHaveBeenCalledWith({
        roleId: '3',
        permissionCodes: ['access-management'],
      });
    });
  });
});
