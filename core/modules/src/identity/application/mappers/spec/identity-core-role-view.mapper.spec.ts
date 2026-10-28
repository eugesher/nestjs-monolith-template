import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IdentityCoreRoleModel } from '../../../domain';
import { IdentityCoreRoleViewMapper } from '../identity-core-role-view.mapper';

describe('IdentityCoreRoleViewMapper', () => {
  describe('toView', () => {
    it('copies the name and the permission codes of the role', () => {
      const role = IdentityCoreRoleModel.reconstitute({
        id: 1,
        name: RoleEnum.ADMIN,
        permissionCodes: [PermissionCodeEnum.IAM_ASSIGN, PermissionCodeEnum.ITEM_READ],
      });

      const view = IdentityCoreRoleViewMapper.toView(role);

      expect(view).toEqual({ name: 'admin', permissionCodes: ['iam:assign', 'item:read'] });
    });
  });
});
