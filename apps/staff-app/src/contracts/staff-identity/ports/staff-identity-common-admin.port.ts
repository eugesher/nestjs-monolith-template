import {
  IStaffIdentityCommonAssignRoleCommand,
  IStaffIdentityCommonAssignRoleView,
  IStaffIdentityCommonRegisterUserCommand,
  IStaffIdentityCommonRegisterUserView,
  IStaffIdentityCommonRoleView,
  IStaffIdentityCommonUpdateRolePermissionsCommand,
} from '../interfaces';

export interface IStaffIdentityCommonAdminPort {
  registerUser(
    command: IStaffIdentityCommonRegisterUserCommand,
  ): Promise<IStaffIdentityCommonRegisterUserView>;
  assignRole(
    command: IStaffIdentityCommonAssignRoleCommand,
  ): Promise<IStaffIdentityCommonAssignRoleView>;
  listRoles(): Promise<IStaffIdentityCommonRoleView[]>;
  updateRolePermissions(
    command: IStaffIdentityCommonUpdateRolePermissionsCommand,
  ): Promise<IStaffIdentityCommonRoleView>;
}

export const STAFF_IDENTITY_COMMON_ADMIN_PORT = Symbol('STAFF_IDENTITY_COMMON_ADMIN_PORT');
