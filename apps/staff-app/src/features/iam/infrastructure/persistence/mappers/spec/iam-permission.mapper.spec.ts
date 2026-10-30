import { StaffPermission } from '@acme-core/entities';
import { IamPermissionMapper } from '../iam-permission.mapper';

describe('IamPermissionMapper', () => {
  describe('toModel', () => {
    it('copies the id and the code', () => {
      const permission = Object.assign(new StaffPermission(), {
        id: 4,
        code: 'ledger:read',
        description: null,
      });

      const model = IamPermissionMapper.toModel(permission);

      expect(model).toMatchObject({ id: 4, code: 'ledger:read' });
    });
  });
});
