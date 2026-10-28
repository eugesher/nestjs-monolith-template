import { IdentityErrorCodeEnum, PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IdentityCorePermissionModel } from '../identity-core-permission.model';
import { IdentityCoreRoleModel } from '../identity-core-role.model';

describe('IdentityCoreRoleModel', () => {
  let role: IdentityCoreRoleModel;

  beforeEach(() => {
    role = IdentityCoreRoleModel.reconstitute({
      id: 2,
      name: RoleEnum.EDITOR,
      permissionCodes: [PermissionCodeEnum.ITEM_READ],
    });
  });

  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      expect(role).toMatchObject({ id: 2, name: 'editor', permissionCodes: ['item:read'] });
    });
  });

  describe('replacePermissions', () => {
    it('replaces the codes with the known ones, without duplicates', () => {
      role.replacePermissions(
        [
          PermissionCodeEnum.ITEM_WRITE,
          PermissionCodeEnum.NOTE_READ,
          PermissionCodeEnum.ITEM_WRITE,
        ],
        [
          IdentityCorePermissionModel.reconstitute({ id: 2, code: PermissionCodeEnum.ITEM_WRITE }),
          IdentityCorePermissionModel.reconstitute({ id: 8, code: PermissionCodeEnum.NOTE_READ }),
        ],
      );

      expect(role.permissionCodes).toEqual(['item:write', 'note:read']);
    });

    it('clears the codes with an empty list', () => {
      role.replacePermissions([], []);

      expect(role.permissionCodes).toEqual([]);
    });

    it('rejects unknown codes and keeps the old ones', () => {
      const replace = (): void =>
        role.replacePermissions(
          [
            PermissionCodeEnum.ITEM_WRITE,
            PermissionCodeEnum.NOTE_READ,
            PermissionCodeEnum.LEDGER_READ,
          ],
          [
            IdentityCorePermissionModel.reconstitute({
              id: 2,
              code: PermissionCodeEnum.ITEM_WRITE,
            }),
          ],
        );

      expect(replace).toThrow(
        expect.objectContaining({
          code: IdentityErrorCodeEnum.AUTH_PERMISSION_NOT_FOUND,
          message: 'Unknown permission codes: note:read, ledger:read',
        }) as Error,
      );
      expect(role.permissionCodes).toEqual(['item:read']);
    });
  });
});
