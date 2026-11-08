import { IdentityExceptionCodeEnum, PermissionCodeEnum } from '@acme-libs/kernel';

import { RolePermissionModel } from '../role-permission.model';
import { RoleModel } from '../role.model';

describe('RoleModel', () => {
  let role: RoleModel;

  beforeEach(() => {
    role = RoleModel.reconstitute({
      id: '2',
      name: 'editor',
      rolePermissions: [{ permission: { code: PermissionCodeEnum.IDENTITY_ROLE_ASSIGN } }],
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

  describe('replacePermissions', () => {
    it('replaces the codes with the known ones, without duplicates', () => {
      role.replacePermissions(
        [
          PermissionCodeEnum.IDENTITY_PERMISSION_ASSIGN,
          PermissionCodeEnum.PRODUCT_READ,
          PermissionCodeEnum.IDENTITY_PERMISSION_ASSIGN,
        ],
        [
          RolePermissionModel.reconstitute({
            id: '2',
            code: PermissionCodeEnum.IDENTITY_PERMISSION_ASSIGN,
          }),
          RolePermissionModel.reconstitute({
            id: '8',
            code: PermissionCodeEnum.PRODUCT_READ,
          }),
        ],
      );

      expect(role.permissionCodes).toEqual(['identity:permission:assign', 'product:read']);
    });

    it('clears the codes with an empty list', () => {
      role.replacePermissions([], []);

      expect(role.permissionCodes).toEqual([]);
    });

    it('rejects unknown codes and keeps the old ones', () => {
      const replace = (): void =>
        role.replacePermissions(
          [
            PermissionCodeEnum.IDENTITY_PERMISSION_ASSIGN,
            PermissionCodeEnum.PRODUCT_READ,
            PermissionCodeEnum.LEDGER_READ,
          ],
          [
            RolePermissionModel.reconstitute({
              id: '2',
              code: PermissionCodeEnum.IDENTITY_PERMISSION_ASSIGN,
            }),
          ],
        );

      expect(replace).toThrow(
        expect.objectContaining({
          code: IdentityExceptionCodeEnum.AUTH_PERMISSION_NOT_FOUND,
          message: 'Unknown permission codes: product:read, ledger:read',
        }) as Error,
      );
      expect(role.permissionCodes).toEqual(['identity:role:assign']);
    });
  });

  describe('toSnapshot', () => {
    it('copies the name and the permission codes of the role', () => {
      const role = RoleModel.reconstitute({
        id: '1',
        name: 'admin',
        rolePermissions: [
          { permission: { code: PermissionCodeEnum.IDENTITY_ROLE_ASSIGN } },
          { permission: { code: PermissionCodeEnum.LEDGER_READ } },
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
