import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-core/entities';
import { StaffIdentityCoreRoleMapper } from '../staff-identity-core-role.mapper';

describe('StaffIdentityCoreRoleMapper', () => {
  describe('toModel', () => {
    it('takes the permission codes from the loaded role permissions, sorted', () => {
      const role = Object.assign(new StaffRole(), {
        id: 2,
        name: 'editor',
        description: 'Edits items',
        rolePermissions: [
          Object.assign(new StaffRolePermission(), {
            permission: Object.assign(new StaffPermission(), { code: 'item:write' }),
          }),
          Object.assign(new StaffRolePermission(), {
            permission: Object.assign(new StaffPermission(), { code: 'item:read' }),
          }),
        ],
      });

      const model = StaffIdentityCoreRoleMapper.toModel(role);

      expect(model).toMatchObject({
        id: 2,
        name: 'editor',
        permissionCodes: ['item:read', 'item:write'],
      });
    });
  });
});
