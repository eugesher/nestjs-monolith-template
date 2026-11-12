import type { Nullable } from '@acme-libs/toolkit';

export interface ICredentialsLibVerifyPasswordCommand {
  passwordHash: Nullable<string>;
  password: string;
}
