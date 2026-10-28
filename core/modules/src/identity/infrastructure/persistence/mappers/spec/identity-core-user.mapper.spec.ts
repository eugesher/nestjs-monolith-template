import { Role, User, UserRole } from '@acme-core/entities';
import { UserStatusEnum } from '@acme-libs/kernel';
import { IdentityCoreUserMapper } from '../identity-core-user.mapper';

describe('IdentityCoreUserMapper', () => {
  describe('toModel', () => {
    it('takes the role names from the loaded user roles, sorted', () => {
      const user = Object.assign(new User(), {
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        userRoles: [
          Object.assign(new UserRole(), { role: Object.assign(new Role(), { name: 'viewer' }) }),
          Object.assign(new UserRole(), { role: Object.assign(new Role(), { name: 'editor' }) }),
        ],
      });

      const model = IdentityCoreUserMapper.toModel(user);

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
