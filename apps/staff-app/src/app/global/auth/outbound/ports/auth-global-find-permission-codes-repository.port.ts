import { IAuthGlobalPermissionCodeFoundRecord } from '../interfaces';

export interface IAuthGlobalFindPermissionCodesRepositoryPort {
  findPermissionCodes(userId: string): Promise<IAuthGlobalPermissionCodeFoundRecord[]>;
}

export const AUTH_GLOBAL_FIND_PERMISSION_CODES_REPOSITORY_PORT = Symbol(
  'AUTH_GLOBAL_FIND_PERMISSION_CODES_REPOSITORY_PORT',
);
