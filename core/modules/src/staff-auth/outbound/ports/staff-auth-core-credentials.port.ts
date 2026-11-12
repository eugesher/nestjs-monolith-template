import type { IStaffAuthCoreCredentialsVerifyPasswordCommand } from '../interfaces';

export interface IStaffAuthCoreCredentialsPort {
  issueAccessToken(userId: string): Promise<string>;
  verifyPassword(command: IStaffAuthCoreCredentialsVerifyPasswordCommand): Promise<boolean>;
}

export const STAFF_AUTH_CORE_CREDENTIALS_PORT = Symbol('STAFF_AUTH_CORE_CREDENTIALS_PORT');
