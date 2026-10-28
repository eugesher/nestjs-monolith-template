import { Maybe } from '@acme-libs/toolkit';
import { IIdentityCoreAccessTokenPayloadCommand } from '../interfaces';

export interface IIdentityCoreAccessTokenPort {
  signAccess(payload: IIdentityCoreAccessTokenPayloadCommand): Promise<string>;
  signRefresh(userId: string): Promise<string>;
  verifyRefresh(refreshToken: string): Promise<Maybe<string>>;
}

export const IDENTITY_CORE_ACCESS_TOKEN_PORT = Symbol('IDENTITY_CORE_ACCESS_TOKEN_PORT');
