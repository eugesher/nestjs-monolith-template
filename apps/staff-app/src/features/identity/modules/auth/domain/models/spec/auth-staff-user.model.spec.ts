import { IdentityErrorCodeEnum, UserStatusEnum } from '@acme-libs/kernel';
import { AuthStaffUserModel } from '../auth-staff-user.model';

describe('AuthStaffUserModel', () => {
  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      const user = AuthStaffUserModel.reconstitute({
        id: 'user-1',
        email: 'viewer@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
      });

      expect(user).toMatchObject({
        id: 'user-1',
        email: 'viewer@example.com',
        passwordHash: 'hash',
        status: 'disabled',
      });
    });
  });

  describe('normalizeEmail', () => {
    it('trims and lowercases the address', () => {
      const email = AuthStaffUserModel.normalizeEmail(' Admin@Example.com ');

      expect(email).toBe('admin@example.com');
    });
  });

  describe('assertActive', () => {
    it('passes for an active user', () => {
      const user = AuthStaffUserModel.reconstitute({
        id: 'user-1',
        email: 'viewer@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });

      expect(() => user.assertActive()).not.toThrow();
    });

    it('rejects a disabled user', () => {
      const user = AuthStaffUserModel.reconstitute({
        id: 'user-1',
        email: 'viewer@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
      });

      expect(() => user.assertActive()).toThrow(
        expect.objectContaining({
          code: IdentityErrorCodeEnum.AUTH_USER_INACTIVE,
          message: 'User user-1 is disabled',
        }) as Error,
      );
    });
  });
});
