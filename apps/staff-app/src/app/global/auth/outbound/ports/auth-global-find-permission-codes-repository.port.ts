import { IAuthGlobalFindPermissionCodesRecord } from '../interfaces';

export interface IAuthGlobalFindPermissionCodesRepositoryPort {
  findPermissionCodes(userId: string): Promise<IAuthGlobalFindPermissionCodesRecord>;
}

export const AUTH_GLOBAL_FIND_PERMISSION_CODES_REPOSITORY_PORT = Symbol(
  'AUTH_GLOBAL_FIND_PERMISSION_CODES_REPOSITORY_PORT',
);
