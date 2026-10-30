import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCommonPermissionModel, StaffIdentityCommonRoleModel } from '../../domain';

export interface IStaffIdentityCommonUpdateRolePermissionsRepositoryPort {
  findRole(name: RoleEnum): Promise<Maybe<StaffIdentityCommonRoleModel>>;
  findPermissions(codes: PermissionCodeEnum[]): Promise<StaffIdentityCommonPermissionModel[]>;
  replacePermissions(role: StaffIdentityCommonRoleModel): Promise<void>;
}

export const STAFF_IDENTITY_COMMON_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_COMMON_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT',
);
