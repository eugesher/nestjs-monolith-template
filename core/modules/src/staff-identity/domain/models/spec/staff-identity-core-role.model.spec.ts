import { IdentityErrorCodeEnum, PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { StaffIdentityCorePermissionModel } from '../staff-identity-core-permission.model';
import { StaffIdentityCoreRoleModel } from '../staff-identity-core-role.model';

describe('StaffIdentityCoreRoleModel', () => {
  let role: StaffIdentityCoreRoleModel;

  beforeEach(() => {
    role = StaffIdentityCoreRoleModel.reconstitute({
      id: 2,
      name: RoleEnum.EDITOR,
      permissionCodes: [PermissionCodeEnum.IAM_ASSIGN],
    });
  });

  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      expect(role).toMatchObject({ id: 2, name: 'editor', permissionCodes: ['iam:assign'] });
    });
  });

  describe('replacePermissions', () => {
    it('replaces the codes with the known ones, without duplicates', () => {
      role.replacePermissions(
        [
          PermissionCodeEnum.IAM_ROLE_EDIT,
          PermissionCodeEnum.NOTE_READ,
          PermissionCodeEnum.IAM_ROLE_EDIT,
        ],
        [
          StaffIdentityCorePermissionModel.reconstitute({
            id: 2,
            code: PermissionCodeEnum.IAM_ROLE_EDIT,
          }),
          StaffIdentityCorePermissionModel.reconstitute({
            id: 8,
            code: PermissionCodeEnum.NOTE_READ,
          }),
        ],
      );

      expect(role.permissionCodes).toEqual(['iam:role-edit', 'note:read']);
    });

    it('clears the codes with an empty list', () => {
      role.replacePermissions([], []);

      expect(role.permissionCodes).toEqual([]);
    });

    it('rejects unknown codes and keeps the old ones', () => {
      const replace = (): void =>
        role.replacePermissions(
          [
            PermissionCodeEnum.IAM_ROLE_EDIT,
            PermissionCodeEnum.NOTE_READ,
            PermissionCodeEnum.LEDGER_READ,
          ],
          [
            StaffIdentityCorePermissionModel.reconstitute({
              id: 2,
              code: PermissionCodeEnum.IAM_ROLE_EDIT,
            }),
          ],
        );

      expect(replace).toThrow(
        expect.objectContaining({
          code: IdentityErrorCodeEnum.AUTH_PERMISSION_NOT_FOUND,
          message: 'Unknown permission codes: note:read, ledger:read',
        }) as Error,
      );
      expect(role.permissionCodes).toEqual(['iam:assign']);
    });
  });
});
