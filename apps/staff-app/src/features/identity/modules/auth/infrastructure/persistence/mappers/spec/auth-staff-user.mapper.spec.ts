import { StaffUser } from '@acme-core/entities';
import { UserStatusEnum } from '@acme-libs/kernel';
import { AuthStaffUserMapper } from '../auth-staff-user.mapper';

describe('AuthStaffUserMapper', () => {
  describe('toModel', () => {
    it('restores the row as a user with its password hash and status', () => {
      const user = Object.assign(new StaffUser(), {
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
        createdAt: new Date('2026-01-01T00:00:00Z'),
      });

      const model = AuthStaffUserMapper.toModel(user);

      expect({ ...model }).toEqual({
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: 'active',
      });
    });
  });
});
