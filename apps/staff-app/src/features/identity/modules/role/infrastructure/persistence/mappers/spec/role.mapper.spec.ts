import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-core/entities';
import { RoleMapper } from '../role.mapper';

describe('RoleMapper', () => {
  describe('toModel', () => {
    it('takes the permission codes from the loaded role permissions, sorted', () => {
      const role = Object.assign(new StaffRole(), {
        id: 2,
        name: 'editor',
        description: 'Edits notes',
        rolePermissions: [
          Object.assign(new StaffRolePermission(), {
            permission: Object.assign(new StaffPermission(), { code: 'iam:role-edit' }),
          }),
          Object.assign(new StaffRolePermission(), {
            permission: Object.assign(new StaffPermission(), { code: 'iam:assign' }),
          }),
        ],
      });

      const model = RoleMapper.toModel(role);

      expect(model).toMatchObject({
        id: 2,
        name: 'editor',
        permissionCodes: ['iam:assign', 'iam:role-edit'],
      });
    });
  });
});
