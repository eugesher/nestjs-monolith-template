import {
  IStaffIdentityCoreAssignRoleCommand,
  IStaffIdentityCoreAssignRoleView,
  IStaffIdentityCoreRegisterUserCommand,
  IStaffIdentityCoreRegisterUserView,
  IStaffIdentityCoreRoleView,
  IStaffIdentityCoreUpdateRolePermissionsCommand,
} from '../interfaces';

export interface IStaffIdentityCoreAdminPort {
  registerUser(
    command: IStaffIdentityCoreRegisterUserCommand,
  ): Promise<IStaffIdentityCoreRegisterUserView>;
  assignRole(
    command: IStaffIdentityCoreAssignRoleCommand,
  ): Promise<IStaffIdentityCoreAssignRoleView>;
  listRoles(): Promise<IStaffIdentityCoreRoleView[]>;
  updateRolePermissions(
    command: IStaffIdentityCoreUpdateRolePermissionsCommand,
  ): Promise<IStaffIdentityCoreRoleView>;
}

export const STAFF_IDENTITY_CORE_ADMIN_PORT = Symbol('STAFF_IDENTITY_CORE_ADMIN_PORT');
