import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IRoleCandidateInput {
  name: string;
  permissionCodes: PermissionCodeEnum[];
}
