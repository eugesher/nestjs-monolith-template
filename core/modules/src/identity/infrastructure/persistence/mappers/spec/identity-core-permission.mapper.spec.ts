import { Permission } from '@acme-core/entities';
import { IdentityCorePermissionMapper } from '../identity-core-permission.mapper';

describe('IdentityCorePermissionMapper', () => {
  describe('toModel', () => {
    it('copies the id and the code', () => {
      const permission = Object.assign(new Permission(), {
        id: 4,
        code: 'ledger:read',
        description: null,
      });

      const model = IdentityCorePermissionMapper.toModel(permission);

      expect(model).toMatchObject({ id: 4, code: 'ledger:read' });
    });
  });
});
