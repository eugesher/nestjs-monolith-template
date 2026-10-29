import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';
import { IamDomainException } from '../../../domain';
import { IamStaffIdentityCoreAdapter } from '../iam-staff-identity-core.adapter';

describe('IamStaffIdentityCoreAdapter', () => {
  let registerUser: jest.Mock;
  let assignRole: jest.Mock;
  let listRoles: jest.Mock;
  let updateRolePermissions: jest.Mock;
  let adapter: IamStaffIdentityCoreAdapter;

  beforeEach(() => {
    registerUser = jest.fn();
    assignRole = jest.fn();
    listRoles = jest.fn();
    updateRolePermissions = jest.fn();
    adapter = new IamStaffIdentityCoreAdapter({
      registerUser,
      assignRole,
      listRoles,
      updateRolePermissions,
    });
  });

  describe('registerUser', () => {
    it('registers through identity and answers the new user', async () => {
      registerUser.mockResolvedValue({ id: 'user-1', email: 'ann@example.com' });

      const user = await adapter.registerUser({
        email: 'ann@example.com',
        password: 'long-enough-password',
        roles: [RoleEnum.EDITOR],
      });

      expect(user).toEqual({ id: 'user-1', email: 'ann@example.com' });
      expect(registerUser).toHaveBeenCalledWith({
        email: 'ann@example.com',
        password: 'long-enough-password',
        roles: ['editor'],
      });
    });

    it('turns an identity refusal into an iam refusal with the same code and message', async () => {
      registerUser.mockRejectedValue(
        Object.assign(Object.create(DomainException.prototype) as DomainException, {
          code: 'AUTH_EMAIL_TAKEN',
          message: 'Email is already registered',
        }),
      );

      const execution = adapter.registerUser({
        email: 'ann@example.com',
        password: 'long-enough-password',
        roles: [],
      });

      await expect(execution).rejects.toBeInstanceOf(IamDomainException);
      await expect(execution).rejects.toMatchObject({
        code: 'AUTH_EMAIL_TAKEN',
        message: 'Email is already registered',
      });
    });

    it('rethrows a domain exception with a code identity does not own', async () => {
      const foreign = Object.assign(Object.create(DomainException.prototype) as DomainException, {
        code: 'LEDGER_SOMETHING',
        message: 'Not an identity refusal',
      });

      registerUser.mockRejectedValue(foreign);

      const execution = adapter.registerUser({
        email: 'ann@example.com',
        password: 'long-enough-password',
        roles: [],
      });

      await expect(execution).rejects.toBe(foreign);
    });

    it('rethrows an error that is not a domain exception', async () => {
      const failure = new Error('Connection lost');

      registerUser.mockRejectedValue(failure);

      const execution = adapter.registerUser({
        email: 'ann@example.com',
        password: 'long-enough-password',
        roles: [],
      });

      await expect(execution).rejects.toBe(failure);
    });
  });

  describe('assignRole', () => {
    it('grants the role through identity and answers the roles of the user', async () => {
      assignRole.mockResolvedValue({ id: 'user-1', roles: [RoleEnum.VIEWER] });

      const user = await adapter.assignRole({ userId: 'user-1', role: RoleEnum.VIEWER });

      expect(user).toEqual({ id: 'user-1', roles: ['viewer'] });
      expect(assignRole).toHaveBeenCalledWith({ userId: 'user-1', role: 'viewer' });
    });

    it('turns an identity refusal into an iam refusal with the same code and message', async () => {
      assignRole.mockRejectedValue(
        Object.assign(Object.create(DomainException.prototype) as DomainException, {
          code: 'AUTH_USER_NOT_FOUND',
          message: 'User user-9 not found',
        }),
      );

      const execution = adapter.assignRole({ userId: 'user-9', role: RoleEnum.VIEWER });

      await expect(execution).rejects.toBeInstanceOf(IamDomainException);
      await expect(execution).rejects.toMatchObject({
        code: 'AUTH_USER_NOT_FOUND',
        message: 'User user-9 not found',
      });
    });
  });

  describe('listRoles', () => {
    it('answers the roles of identity', async () => {
      listRoles.mockResolvedValue([{ name: RoleEnum.VIEWER, permissionCodes: [] }]);

      const roles = await adapter.listRoles();

      expect(roles).toEqual([{ name: 'viewer', permissionCodes: [] }]);
    });
  });

  describe('updateRolePermissions', () => {
    it('replaces the permissions through identity and answers the role', async () => {
      updateRolePermissions.mockResolvedValue({
        name: RoleEnum.VIEWER,
        permissionCodes: [PermissionCodeEnum.ITEM_READ],
      });

      const role = await adapter.updateRolePermissions({
        role: RoleEnum.VIEWER,
        permissionCodes: [PermissionCodeEnum.ITEM_READ],
      });

      expect(role).toEqual({ name: 'viewer', permissionCodes: ['item:read'] });
      expect(updateRolePermissions).toHaveBeenCalledWith({
        role: 'viewer',
        permissionCodes: ['item:read'],
      });
    });

    it('turns an identity refusal into an iam refusal with the same code and message', async () => {
      updateRolePermissions.mockRejectedValue(
        Object.assign(Object.create(DomainException.prototype) as DomainException, {
          code: 'AUTH_ROLE_NOT_FOUND',
          message: 'Role ghost not found',
        }),
      );

      const execution = adapter.updateRolePermissions({
        role: RoleEnum.VIEWER,
        permissionCodes: [PermissionCodeEnum.ITEM_READ],
      });

      await expect(execution).rejects.toBeInstanceOf(IamDomainException);
      await expect(execution).rejects.toMatchObject({
        code: 'AUTH_ROLE_NOT_FOUND',
        message: 'Role ghost not found',
      });
    });
  });
});
