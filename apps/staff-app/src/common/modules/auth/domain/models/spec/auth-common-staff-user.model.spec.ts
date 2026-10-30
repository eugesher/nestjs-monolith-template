import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { AuthCommonStaffUserModel } from '../auth-common-staff-user.model';

describe('AuthCommonStaffUserModel', () => {
  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      const user = AuthCommonStaffUserModel.reconstitute({
        id: 'user-1',
        email: 'viewer@example.com',
        status: UserStatusEnum.DISABLED,
        roles: [RoleEnum.VIEWER],
      });

      expect(user).toMatchObject({
        id: 'user-1',
        email: 'viewer@example.com',
        status: 'disabled',
        roles: ['viewer'],
        isActive: false,
      });
    });
  });

  describe('isActive', () => {
    it('is true for an active user', () => {
      const user = AuthCommonStaffUserModel.reconstitute({
        id: 'user-1',
        email: 'viewer@example.com',
        status: UserStatusEnum.ACTIVE,
        roles: [],
      });

      expect(user.isActive).toBe(true);
    });
  });
});
