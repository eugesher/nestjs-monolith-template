import { Maybe } from '@acme-libs/toolkit';
import {
  IIdentityCoreLoginCommand,
  IIdentityCoreRefreshTokenCommand,
  IIdentityCoreSubjectView,
  IIdentityCoreTokenPairView,
  IIdentityCoreValidateSubjectQuery,
} from '../interfaces';

export interface IIdentityCoreSessionPort {
  login(command: IIdentityCoreLoginCommand): Promise<IIdentityCoreTokenPairView>;
  refreshToken(command: IIdentityCoreRefreshTokenCommand): Promise<IIdentityCoreTokenPairView>;
  validateSubject(
    query: IIdentityCoreValidateSubjectQuery,
  ): Promise<Maybe<IIdentityCoreSubjectView>>;
}

export const IDENTITY_CORE_SESSION_PORT = Symbol('IDENTITY_CORE_SESSION_PORT');
