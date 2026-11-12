import type { Maybe } from '@acme-libs/toolkit';

import type { StaffAuthCoreLoginOutcomeEnum } from '../../enums/staff-auth-core-login-outcome.enum';

export interface IStaffAuthCoreLoginView {
  outcome: StaffAuthCoreLoginOutcomeEnum;
  userId: Maybe<string>;
  accessToken: Maybe<string>;
}
