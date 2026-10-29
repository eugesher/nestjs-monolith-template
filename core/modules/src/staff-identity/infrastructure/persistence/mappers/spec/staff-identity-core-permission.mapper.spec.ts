import { StaffPermission } from '@acme-core/entities';
import { StaffIdentityCorePermissionMapper } from '../staff-identity-core-permission.mapper';

describe('StaffIdentityCorePermissionMapper', () => {
  describe('toModel', () => {
    it('copies the id and the code', () => {
      const permission = Object.assign(new StaffPermission(), {
        id: 4,
        code: 'ledger:read',
        description: null,
      });

      const model = StaffIdentityCorePermissionMapper.toModel(permission);

      expect(model).toMatchObject({ id: 4, code: 'ledger:read' });
    });
  });
});
