import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonRoleModel } from '../../../domain';
import { StaffIdentityCommonRoleViewMapper } from '../staff-identity-common-role-view.mapper';

describe('StaffIdentityCommonRoleViewMapper', () => {
  describe('toView', () => {
    it('copies the name and the permission codes of the role', () => {
      const role = StaffIdentityCommonRoleModel.reconstitute({
        id: 1,
        name: RoleEnum.ADMIN,
        permissionCodes: [PermissionCodeEnum.IAM_ASSIGN, PermissionCodeEnum.LEDGER_READ],
      });

      const view = StaffIdentityCommonRoleViewMapper.toView(role);

      expect(view).toEqual({ name: 'admin', permissionCodes: ['iam:assign', 'ledger:read'] });
    });
  });
});
