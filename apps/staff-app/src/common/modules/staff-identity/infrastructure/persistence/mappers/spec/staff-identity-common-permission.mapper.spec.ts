import { StaffPermission } from '@acme-core/entities';
import { StaffIdentityCommonPermissionMapper } from '../staff-identity-common-permission.mapper';

describe('StaffIdentityCommonPermissionMapper', () => {
  describe('toModel', () => {
    it('copies the id and the code', () => {
      const permission = Object.assign(new StaffPermission(), {
        id: 4,
        code: 'ledger:read',
        description: null,
      });

      const model = StaffIdentityCommonPermissionMapper.toModel(permission);

      expect(model).toMatchObject({ id: 4, code: 'ledger:read' });
    });
  });
});
