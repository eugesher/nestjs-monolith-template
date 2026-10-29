import { IdentityErrorCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreUserModel } from '../staff-identity-core-user.model';

describe('StaffIdentityCoreUserModel', () => {
  describe('register', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('creates an active user with a generated id and a normalized email', () => {
      jest.spyOn(crypto, 'randomUUID').mockReturnValue('5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f');

      const user = StaffIdentityCoreUserModel.register({
        email: '  Editor@Example.COM ',
        passwordHash: 'hash',
        roles: [RoleEnum.EDITOR, RoleEnum.EDITOR, RoleEnum.VIEWER],
      });

      expect(user).toMatchObject({
        id: '5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
        roles: ['editor', 'viewer'],
      });
    });

    it.each(['editor', 'editor@', '@example.com', 'editor@example', 'ed itor@example.com'])(
      'rejects the malformed email %s',
      (email) => {
        const register = (): StaffIdentityCoreUserModel =>
          StaffIdentityCoreUserModel.register({ email, passwordHash: 'hash', roles: [] });

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
      const user = StaffIdentityCoreUserModel.reconstitute({
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
        isActive: false,
      });
    });
  });

  describe('normalizeEmail', () => {
    it('trims and lowercases the address', () => {
      const email = StaffIdentityCoreUserModel.normalizeEmail(' Admin@Example.com ');

      expect(email).toBe('admin@example.com');
    });
  });

  describe('assertPasswordStrength', () => {
    it('accepts a password of 12 characters', () => {
      const assert = (): void => StaffIdentityCoreUserModel.assertPasswordStrength('123456789012');

      expect(assert).not.toThrow();
    });

    it('rejects a password of 11 characters', () => {
      const assert = (): void => StaffIdentityCoreUserModel.assertPasswordStrength('12345678901');

      expect(assert).toThrow(
        expect.objectContaining({
          code: IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
          message: 'Password must be at least 12 characters',
        }) as Error,
      );
    });
  });

  describe('assertActive', () => {
    it('passes for an active user', () => {
      const user = StaffIdentityCoreUserModel.reconstitute({
        id: 'user-1',
        email: 'viewer@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
        roles: [],
      });

      expect(() => user.assertActive()).not.toThrow();
    });

    it('rejects a disabled user', () => {
      const user = StaffIdentityCoreUserModel.reconstitute({
        id: 'user-1',
        email: 'viewer@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
        roles: [],
      });

      expect(() => user.assertActive()).toThrow(
        expect.objectContaining({
          code: IdentityErrorCodeEnum.AUTH_USER_INACTIVE,
          message: 'User user-1 is disabled',
        }) as Error,
      );
    });
  });

  describe('assignRole', () => {
    let user: StaffIdentityCoreUserModel;

    beforeEach(() => {
      user = StaffIdentityCoreUserModel.reconstitute({
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
