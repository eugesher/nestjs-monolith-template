import { PermissionCodeEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonPermissionModel } from '../staff-identity-common-permission.model';

describe('StaffIdentityCommonPermissionModel', () => {
  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      const permission = StaffIdentityCommonPermissionModel.reconstitute({
        id: 4,
        code: PermissionCodeEnum.LEDGER_READ,
      });

      expect(permission).toMatchObject({ id: 4, code: 'ledger:read' });
    });
  });
});
