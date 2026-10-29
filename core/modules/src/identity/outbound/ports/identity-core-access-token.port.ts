import { IIdentityCoreAccessTokenPayloadCommand } from '../interfaces';

export interface IIdentityCoreAccessTokenPort {
  sign(payload: IIdentityCoreAccessTokenPayloadCommand): Promise<string>;
}

export const IDENTITY_CORE_ACCESS_TOKEN_PORT = Symbol('IDENTITY_CORE_ACCESS_TOKEN_PORT');
