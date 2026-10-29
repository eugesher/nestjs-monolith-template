import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreRoleModel } from '../../../domain';
import { StaffIdentityCoreRoleViewMapper } from '../staff-identity-core-role-view.mapper';

describe('StaffIdentityCoreRoleViewMapper', () => {
  describe('toView', () => {
    it('copies the name and the permission codes of the role', () => {
      const role = StaffIdentityCoreRoleModel.reconstitute({
        id: 1,
        name: RoleEnum.ADMIN,
        permissionCodes: [PermissionCodeEnum.IAM_ASSIGN, PermissionCodeEnum.ITEM_READ],
      });

      const view = StaffIdentityCoreRoleViewMapper.toView(role);

      expect(view).toEqual({ name: 'admin', permissionCodes: ['iam:assign', 'item:read'] });
    });
  });
});
