import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import {
  IStaffIdentityCommonAccessTokenView,
  IStaffIdentityCommonFindPermissionCodesQuery,
  IStaffIdentityCommonLoginCommand,
  IStaffIdentityCommonSubjectView,
  IStaffIdentityCommonValidateSubjectQuery,
} from '../interfaces';

export interface IStaffIdentityCommonAuthPort {
  login(command: IStaffIdentityCommonLoginCommand): Promise<IStaffIdentityCommonAccessTokenView>;
  validateSubject(
    query: IStaffIdentityCommonValidateSubjectQuery,
  ): Promise<Maybe<IStaffIdentityCommonSubjectView>>;
  findPermissionCodes(
    query: IStaffIdentityCommonFindPermissionCodesQuery,
  ): Promise<PermissionCodeEnum[]>;
}

export const STAFF_IDENTITY_COMMON_AUTH_PORT = Symbol('STAFF_IDENTITY_COMMON_AUTH_PORT');
