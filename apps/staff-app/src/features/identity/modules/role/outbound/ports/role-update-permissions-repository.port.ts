import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

import {
  IRoleFoundRecord,
  IRolePermissionFoundRecord,
  IRolePermissionInsertCommand,
} from '../interfaces';

export interface IRoleUpdatePermissionsRepositoryPort {
  findRole(name: RoleEnum): Promise<Nullable<IRoleFoundRecord>>;
  findPermissions(codes: PermissionCodeEnum[]): Promise<IRolePermissionFoundRecord[]>;
  deleteRolePermissions(roleId: string): Promise<void>;
  insertRolePermissions(commands: IRolePermissionInsertCommand[]): Promise<void>;
}

export const ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT = Symbol(
  'ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT',
);
