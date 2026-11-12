import { UserStatusEnum } from '@acme-libs/kernel';

import { StaffAuthCoreUserModel } from '../staff-auth-core-user.model';

describe('StaffAuthCoreUserModel', () => {
  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      const user = StaffAuthCoreUserModel.reconstitute({
        id: 'user-1',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
      });

      expect(user).toMatchObject({
        id: 'user-1',
        passwordHash: 'hash',
        status: 'disabled',
      });
    });
  });

  describe('normalizeEmail', () => {
    it('trims and lowercases the address', () => {
      const email = StaffAuthCoreUserModel.normalizeEmail(' Admin@Example.com ');

      expect(email).toBe('admin@example.com');
    });
  });

  describe('isActive', () => {
    it('answers true for an active user', () => {
      const user = StaffAuthCoreUserModel.reconstitute({
        id: 'user-1',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });

      expect(user.isActive()).toBe(true);
    });

    it('answers false for a disabled user', () => {
      const user = StaffAuthCoreUserModel.reconstitute({
        id: 'user-1',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
      });

      expect(user.isActive()).toBe(false);
    });
  });
});
