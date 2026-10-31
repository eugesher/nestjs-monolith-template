import { PermissionCodeEnum } from '@acme-libs/kernel';
import { RolePermissionModel } from '../role-permission.model';

describe('RolePermissionModel', () => {
  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      const permission = RolePermissionModel.reconstitute({
        id: 4,
        code: PermissionCodeEnum.LEDGER_READ,
      });

      expect(permission).toMatchObject({ id: 4, code: 'ledger:read' });
    });
  });
});
