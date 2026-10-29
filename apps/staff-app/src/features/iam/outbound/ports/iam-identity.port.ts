import {
  IIamIdentityAssignRoleCommand,
  IIamIdentityRegisterUserCommand,
  IIamIdentityRoleView,
  IIamIdentityUpdateRolePermissionsCommand,
  IIamIdentityUserRolesView,
  IIamIdentityUserView,
} from '../interfaces';

export interface IIamIdentityPort {
  registerUser(command: IIamIdentityRegisterUserCommand): Promise<IIamIdentityUserView>;
  assignRole(command: IIamIdentityAssignRoleCommand): Promise<IIamIdentityUserRolesView>;
  listRoles(): Promise<IIamIdentityRoleView[]>;
  updateRolePermissions(
    command: IIamIdentityUpdateRolePermissionsCommand,
  ): Promise<IIamIdentityRoleView>;
}

export const IAM_IDENTITY_PORT = Symbol('IAM_IDENTITY_PORT');
