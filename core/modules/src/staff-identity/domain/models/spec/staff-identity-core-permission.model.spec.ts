import { PermissionCodeEnum } from '@acme-libs/kernel';
import { StaffIdentityCorePermissionModel } from '../staff-identity-core-permission.model';

describe('StaffIdentityCorePermissionModel', () => {
  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      const permission = StaffIdentityCorePermissionModel.reconstitute({
        id: 4,
        code: PermissionCodeEnum.LEDGER_READ,
      });

      expect(permission).toMatchObject({ id: 4, code: 'ledger:read' });
    });
  });
});
