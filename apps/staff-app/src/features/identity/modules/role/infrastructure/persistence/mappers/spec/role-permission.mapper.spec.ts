import { StaffPermission } from '@acme-core/entities';
import { RolePermissionMapper } from '../role-permission.mapper';

describe('RolePermissionMapper', () => {
  describe('toModel', () => {
    it('copies the id and the code', () => {
      const permission = Object.assign(new StaffPermission(), {
        id: 4,
        code: 'ledger:read',
        description: null,
      });

      const model = RolePermissionMapper.toModel(permission);

      expect(model).toMatchObject({ id: 4, code: 'ledger:read' });
    });
  });
});
