import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCorePermissionModel, StaffIdentityCoreRoleModel } from '../../domain';

export interface IStaffIdentityCoreUpdateRolePermissionsRepositoryPort {
  findRole(name: RoleEnum): Promise<Maybe<StaffIdentityCoreRoleModel>>;
  findPermissions(codes: PermissionCodeEnum[]): Promise<StaffIdentityCorePermissionModel[]>;
  replacePermissions(role: StaffIdentityCoreRoleModel): Promise<void>;
}

export const STAFF_IDENTITY_CORE_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_CORE_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT',
);
