import { IStaffIdentityCoreAccessTokenPayloadCommand } from '../interfaces';

export interface IStaffIdentityCoreAccessTokenPort {
  sign(payload: IStaffIdentityCoreAccessTokenPayloadCommand): Promise<string>;
}

export const STAFF_IDENTITY_CORE_ACCESS_TOKEN_PORT = Symbol(
  'STAFF_IDENTITY_CORE_ACCESS_TOKEN_PORT',
);
