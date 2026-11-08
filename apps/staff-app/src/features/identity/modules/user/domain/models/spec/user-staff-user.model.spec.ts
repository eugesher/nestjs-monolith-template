import { IdentityExceptionCodeEnum, UserStatusEnum } from '@acme-libs/kernel';

import { IUserStaffUserDraftOutput } from '../../interfaces';
import { UserStaffUserModel } from '../user-staff-user.model';

describe('UserStaffUserModel', () => {
  describe('createDraft', () => {
    it(
      'drafts an active user with a normalized email, ' +
        'unique roles and no id until it is stored',
      () => {
        const draft = UserStaffUserModel.createDraft({
          email: '  Editor@Example.COM ',
          passwordHash: 'hash',
          roleIds: ['2', '2', '3'],
        });

        expect(draft).toEqual({
          email: 'editor@example.com',
          passwordHash: 'hash',
          status: UserStatusEnum.ACTIVE,
          roleIds: ['2', '3'],
        });
      },
    );

    it.each(['editor', 'editor@', '@example.com', 'editor@example', 'ed itor@example.com'])(
      'rejects the malformed email %s',
      (email) => {
        const register = (): IUserStaffUserDraftOutput =>
          UserStaffUserModel.createDraft({ email, passwordHash: 'hash', roles: [] });

        expect(register).toThrow(
          expect.objectContaining({
            code: IdentityExceptionCodeEnum.AUTH_EMAIL_INVALID,
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
        userRoles: [{ role: { name: 'viewer' } }],
      });

      expect(user).toMatchObject({
        id: 'user-1',
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
          code: IdentityExceptionCodeEnum.AUTH_PASSWORD_TOO_WEAK,
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
        userRoles: [{ role: { name: 'viewer' } }],
      });
    });

    it('adds a new role and reports the change', () => {
      const added = user.assignRole('editor');

      expect(added).toBe(true);
      expect(user.roles).toEqual(['viewer', 'editor']);
    });

    it('keeps a role the user already has and reports no change', () => {
      const added = user.assignRole('viewer');

      expect(added).toBe(false);
      expect(user.roles).toEqual(['viewer']);
    });
  });
});
