import {
  IIdentityCoreAssignRoleCommand,
  IIdentityCoreAssignRoleView,
  IIdentityCoreRegisterUserCommand,
  IIdentityCoreRegisterUserView,
  IIdentityCoreRoleView,
  IIdentityCoreUpdateRolePermissionsCommand,
} from '../interfaces';

export interface IIdentityCoreAdminPort {
  registerUser(command: IIdentityCoreRegisterUserCommand): Promise<IIdentityCoreRegisterUserView>;
  assignRole(command: IIdentityCoreAssignRoleCommand): Promise<IIdentityCoreAssignRoleView>;
  listRoles(): Promise<IIdentityCoreRoleView[]>;
  updateRolePermissions(
    command: IIdentityCoreUpdateRolePermissionsCommand,
  ): Promise<IIdentityCoreRoleView>;
}

export const IDENTITY_CORE_ADMIN_PORT = Symbol('IDENTITY_CORE_ADMIN_PORT');
