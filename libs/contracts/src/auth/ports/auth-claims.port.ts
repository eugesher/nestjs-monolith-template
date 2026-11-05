import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

import { IAuthFindPermissionCodesCommand, IAuthFindRolesCommand } from '../interfaces';

export interface IAuthClaimsPort {
  findRoles(command: IAuthFindRolesCommand): Promise<RoleEnum[]>;
  findPermissionCodes(command: IAuthFindPermissionCodesCommand): Promise<PermissionCodeEnum[]>;
}

export const AUTH_CLAIMS_PORT = Symbol('AUTH_CLAIMS_PORT');
