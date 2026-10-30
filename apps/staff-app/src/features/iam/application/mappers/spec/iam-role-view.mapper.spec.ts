import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IamRoleModel } from '../../../domain';
import { IamRoleViewMapper } from '../iam-role-view.mapper';

describe('IamRoleViewMapper', () => {
  describe('toView', () => {
    it('copies the name and the permission codes of the role', () => {
      const role = IamRoleModel.reconstitute({
        id: 1,
        name: RoleEnum.ADMIN,
        permissionCodes: [PermissionCodeEnum.IAM_ASSIGN, PermissionCodeEnum.LEDGER_READ],
      });

      const view = IamRoleViewMapper.toView(role);

      expect(view).toEqual({ name: 'admin', permissionCodes: ['iam:assign', 'ledger:read'] });
    });
  });
});
