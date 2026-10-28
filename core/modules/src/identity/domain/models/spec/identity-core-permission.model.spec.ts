import { PermissionCodeEnum } from '@acme-libs/kernel';
import { IdentityCorePermissionModel } from '../identity-core-permission.model';

describe('IdentityCorePermissionModel', () => {
  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      const permission = IdentityCorePermissionModel.reconstitute({
        id: 4,
        code: PermissionCodeEnum.LEDGER_READ,
      });

      expect(permission).toMatchObject({ id: 4, code: 'ledger:read' });
    });
  });
});
