import { RoleModel, RolePermissionModel } from '../../../domain';

export interface IRoleReplacePermissionsCommand {
  role: RoleModel;
  permissions: RolePermissionModel[];
}
