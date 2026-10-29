import { StaffRole, StaffUser, StaffUserRole } from '@acme-core/entities';
import { UserStatusEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreUserMapper } from '../staff-identity-core-user.mapper';

describe('StaffIdentityCoreUserMapper', () => {
  describe('toModel', () => {
    it('takes the role names from the loaded user roles, sorted', () => {
      const user = Object.assign(new StaffUser(), {
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        userRoles: [
          Object.assign(new StaffUserRole(), {
            role: Object.assign(new StaffRole(), { name: 'viewer' }),
          }),
          Object.assign(new StaffUserRole(), {
            role: Object.assign(new StaffRole(), { name: 'editor' }),
          }),
        ],
      });

      const model = StaffIdentityCoreUserMapper.toModel(user);

      expect(model).toMatchObject({
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: 'active',
        roles: ['editor', 'viewer'],
      });
    });
  });
});
