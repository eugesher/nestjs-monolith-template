import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export interface IIdentityCoreAccessTokenPayloadCommand {
  sub: string;
  email: string;
  roles: RoleEnum[];
  permissions: PermissionCodeEnum[];
}
