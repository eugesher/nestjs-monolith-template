import { PermissionCodeEnum } from '@acme-libs/kernel';

import { RoleModel } from '../role.model';

describe('RoleModel', () => {
  let role: RoleModel;

  beforeEach(() => {
    role = RoleModel.reconstitute({
      id: '2',
      name: 'editor',
      rolePermissions: [{ code: PermissionCodeEnum.ACCESS_MANAGEMENT }],
    });
  });

  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      expect(role).toMatchObject({
        id: '2',
        name: 'editor',
        permissionCodes: ['access-management'],
      });
    });
  });

  describe('createDraft', () => {
    it('keeps the name and drops the duplicate codes', () => {
      const draft = RoleModel.createDraft({
        name: 'auditor',
        permissionCodes: [PermissionCodeEnum.LEDGER_READ, PermissionCodeEnum.LEDGER_READ],
      });

      expect(draft).toEqual({ name: 'auditor', permissionCodes: ['ledger:read'] });
    });
  });

  describe('reassignPermissions', () => {
    it('reassigns the codes, without duplicates', () => {
      role.reassignPermissions([
        PermissionCodeEnum.ACCESS_MANAGEMENT,
        PermissionCodeEnum.PRODUCT_READ,
        PermissionCodeEnum.ACCESS_MANAGEMENT,
      ]);

      expect(role.permissionCodes).toEqual(['access-management', 'product:read']);
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
          { code: PermissionCodeEnum.ACCESS_MANAGEMENT },
          { code: PermissionCodeEnum.LEDGER_READ },
        ],
      });

      const view = role.toSnapshot();

      expect(view).toEqual({
        id: '1',
        name: 'admin',
        permissionCodes: ['access-management', 'ledger:read'],
      });
    });
  });
});
