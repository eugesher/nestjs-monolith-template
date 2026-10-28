import { Permission, Role, RolePermission } from '@acme-core/entities';
import { IdentityCoreRoleMapper } from '../identity-core-role.mapper';

describe('IdentityCoreRoleMapper', () => {
  describe('toModel', () => {
    it('takes the permission codes from the loaded role permissions, sorted', () => {
      const role = Object.assign(new Role(), {
        id: 2,
        name: 'editor',
        description: 'Edits items',
        rolePermissions: [
          Object.assign(new RolePermission(), {
            permission: Object.assign(new Permission(), { code: 'item:write' }),
          }),
          Object.assign(new RolePermission(), {
            permission: Object.assign(new Permission(), { code: 'item:read' }),
          }),
        ],
      });

      const model = IdentityCoreRoleMapper.toModel(role);

      expect(model).toMatchObject({
        id: 2,
        name: 'editor',
        permissionCodes: ['item:read', 'item:write'],
      });
    });
  });
});
