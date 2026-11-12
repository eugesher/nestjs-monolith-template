import type { Nullable } from '@acme-libs/toolkit';

export interface IAuthCredentialsVerifyPasswordCommand {
  passwordHash: Nullable<string>;
  password: string;
}
