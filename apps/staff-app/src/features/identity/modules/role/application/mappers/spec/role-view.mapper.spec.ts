import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { RoleModel } from '../../../domain';
import { RoleViewMapper } from '../role-view.mapper';

describe('RoleViewMapper', () => {
  describe('toView', () => {
    it('copies the name and the permission codes of the role', () => {
      const role = RoleModel.reconstitute({
        id: 1,
        name: RoleEnum.ADMIN,
        permissionCodes: [PermissionCodeEnum.IAM_ASSIGN, PermissionCodeEnum.LEDGER_READ],
      });

      const view = RoleViewMapper.toView(role);

      expect(view).toEqual({ name: 'admin', permissionCodes: ['iam:assign', 'ledger:read'] });
    });
  });
});
