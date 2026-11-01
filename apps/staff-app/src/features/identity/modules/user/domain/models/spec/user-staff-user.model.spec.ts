import { IdentityErrorCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';

import { IUserStaffUserDraft } from '../../interfaces/user-staff-user-draft.interface';
import { UserStaffUserModel } from '../user-staff-user.model';

describe('UserStaffUserModel', () => {
  describe('register', () => {
    it('drafts an active user with a normalized email, unique roles and no id until it is stored', () => {
      const draft = UserStaffUserModel.register({
        email: '  Editor@Example.COM ',
        passwordHash: 'hash',
        roles: [RoleEnum.EDITOR, RoleEnum.EDITOR, RoleEnum.VIEWER],
      });

      expect(draft).toEqual({
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
        roles: ['editor', 'viewer'],
      });
    });

    it.each(['editor', 'editor@', '@example.com', 'editor@example', 'ed itor@example.com'])(
      'rejects the malformed email %s',
      (email) => {
        const register = (): IUserStaffUserDraft =>
          UserStaffUserModel.register({ email, passwordHash: 'hash', roles: [] });

        expect(register).toThrow(
          expect.objectContaining({
            code: IdentityErrorCodeEnum.AUTH_EMAIL_INVALID,
            message: 'User email must be a well-formed address',
          }) as Error,
        );
      },
    );
  });

  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      const user = UserStaffUserModel.reconstitute({
        id: 'user-1',
        email: 'viewer@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
        roles: [RoleEnum.VIEWER],
      });

      expect(user).toMatchObject({
        id: 'user-1',
        email: 'viewer@example.com',
        passwordHash: 'hash',
        status: 'disabled',
        roles: ['viewer'],
      });
    });
  });

  describe('assertPasswordStrength', () => {
    it('accepts a password of 12 characters', () => {
      const assert = (): void => UserStaffUserModel.assertPasswordStrength('123456789012');

      expect(assert).not.toThrow();
    });

    it('rejects a password of 11 characters', () => {
      const assert = (): void => UserStaffUserModel.assertPasswordStrength('12345678901');

      expect(assert).toThrow(
        expect.objectContaining({
          code: IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
          message: 'Password must be at least 12 characters',
        }) as Error,
      );
    });
  });

  describe('assignRole', () => {
    let user: UserStaffUserModel;

    beforeEach(() => {
      user = UserStaffUserModel.reconstitute({
        id: 'user-1',
        email: 'viewer@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
        roles: [RoleEnum.VIEWER],
      });
    });

    it('adds a new role and reports the change', () => {
      const added = user.assignRole(RoleEnum.EDITOR);

      expect(added).toBe(true);
      expect(user.roles).toEqual(['viewer', 'editor']);
    });

    it('keeps a role the user already has and reports no change', () => {
      const added = user.assignRole(RoleEnum.VIEWER);

      expect(added).toBe(false);
      expect(user.roles).toEqual(['viewer']);
    });
  });
});
