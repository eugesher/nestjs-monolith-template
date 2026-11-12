import type { Nullable } from '@acme-libs/toolkit';

export interface IStaffAuthCoreCredentialsVerifyPasswordCommand {
  passwordHash: Nullable<string>;
  password: string;
}
