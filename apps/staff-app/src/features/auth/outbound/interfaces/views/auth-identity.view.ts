import type { Maybe } from '@acme-libs/toolkit';

import type { AuthIdentityLoginOutcomeEnum } from '../../enums/auth-identity-login-outcome.enum';

export interface IAuthIdentitySubjectView {
  id: string;
  email: string;
  roles: string[];
}

export interface IAuthIdentityLoginView {
  outcome: AuthIdentityLoginOutcomeEnum;
  userId: Maybe<string>;
  accessToken: Maybe<string>;
}
