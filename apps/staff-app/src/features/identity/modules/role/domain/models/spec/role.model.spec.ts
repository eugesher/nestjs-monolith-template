import { PermissionCodeEnum } from '@acme-libs/kernel';

import { RoleModel } from '../role.model';

describe('RoleModel', () => {
  let role: RoleModel;

  beforeEach(() => {
    role = RoleModel.reconstitute({
      id: '2',
      name: 'editor',
      rolePermissions: [{ code: PermissionCodeEnum.IDENTITY_ROLE_ASSIGN }],
    });
  });

  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      expect(role).toMatchObject({
        id: '2',
        name: 'editor',
        permissionCodes: ['identity:role:assign'],
      });
    });
  });

  describe('reassignPermissions', () => {
    it('reassigns the codes, without duplicates', () => {
      role.reassignPermissions([
        PermissionCodeEnum.IDENTITY_PERMISSION_ASSIGN,
        PermissionCodeEnum.PRODUCT_READ,
        PermissionCodeEnum.IDENTITY_PERMISSION_ASSIGN,
      ]);

      expect(role.permissionCodes).toEqual(['identity:permission:assign', 'product:read']);
    });

    it('clears the codes with an empty list', () => {
      role.reassignPermissions([]);

      expect(role.permissionCodes).toEqual([]);
    });
  });

  describe('toSnapshot', () => {
    it('copies the name and the permission codes of the role', () => {
      const role = RoleModel.reconstitute({
        id: '1',
        name: 'admin',
        rolePermissions: [
          { code: PermissionCodeEnum.IDENTITY_ROLE_ASSIGN },
          { code: PermissionCodeEnum.LEDGER_READ },
        ],
      });

      const view = role.toSnapshot();

      expect(view).toEqual({
        id: '1',
        name: 'admin',
        permissionCodes: ['identity:role:assign', 'ledger:read'],
      });
    });
  });
});
