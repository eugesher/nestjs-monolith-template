import { PermissionCodeEnum } from '@acme-libs/kernel';
import { IamPermissionModel } from '../iam-permission.model';

describe('IamPermissionModel', () => {
  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      const permission = IamPermissionModel.reconstitute({
        id: 4,
        code: PermissionCodeEnum.LEDGER_READ,
      });

      expect(permission).toMatchObject({ id: 4, code: 'ledger:read' });
    });
  });
});
