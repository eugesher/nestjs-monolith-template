import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IAuthFindPermissionCodesQuery, IAuthFindRolesQuery } from '../interfaces';

export interface IAuthClaimsPort {
  findRoles(query: IAuthFindRolesQuery): Promise<RoleEnum[]>;
  findPermissionCodes(query: IAuthFindPermissionCodesQuery): Promise<PermissionCodeEnum[]>;
}

export const AUTH_CLAIMS_PORT = Symbol('AUTH_CLAIMS_PORT');
