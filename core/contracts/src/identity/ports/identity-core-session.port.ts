import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import {
  IIdentityCoreAccessTokenView,
  IIdentityCoreFindPermissionCodesQuery,
  IIdentityCoreLoginCommand,
  IIdentityCoreSubjectView,
  IIdentityCoreValidateSubjectQuery,
} from '../interfaces';

export interface IIdentityCoreSessionPort {
  login(command: IIdentityCoreLoginCommand): Promise<IIdentityCoreAccessTokenView>;
  validateSubject(
    query: IIdentityCoreValidateSubjectQuery,
  ): Promise<Maybe<IIdentityCoreSubjectView>>;
  findPermissionCodes(query: IIdentityCoreFindPermissionCodesQuery): Promise<PermissionCodeEnum[]>;
}

export const IDENTITY_CORE_SESSION_PORT = Symbol('IDENTITY_CORE_SESSION_PORT');
