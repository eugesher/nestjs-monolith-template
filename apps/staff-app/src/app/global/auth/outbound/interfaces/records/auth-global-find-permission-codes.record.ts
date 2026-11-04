import { PermissionCodeEnum } from '@acme-libs/kernel';

export interface IAuthGlobalFindPermissionCodesRecordItem {
  code: PermissionCodeEnum;
}

export type IAuthGlobalFindPermissionCodesRecord = IAuthGlobalFindPermissionCodesRecordItem[];
