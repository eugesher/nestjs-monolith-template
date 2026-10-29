import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import {
  IStaffIdentityCoreAccessTokenView,
  IStaffIdentityCoreFindPermissionCodesQuery,
  IStaffIdentityCoreLoginCommand,
  IStaffIdentityCoreSubjectView,
  IStaffIdentityCoreValidateSubjectQuery,
} from '../interfaces';

export interface IStaffIdentityCoreSessionPort {
  login(command: IStaffIdentityCoreLoginCommand): Promise<IStaffIdentityCoreAccessTokenView>;
  validateSubject(
    query: IStaffIdentityCoreValidateSubjectQuery,
  ): Promise<Maybe<IStaffIdentityCoreSubjectView>>;
  findPermissionCodes(
    query: IStaffIdentityCoreFindPermissionCodesQuery,
  ): Promise<PermissionCodeEnum[]>;
}

export const STAFF_IDENTITY_CORE_SESSION_PORT = Symbol('STAFF_IDENTITY_CORE_SESSION_PORT');
