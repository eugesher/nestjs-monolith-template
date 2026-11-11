import type { StaffRole, StaffUser } from '@acme-core/entities';

import type { UserRegisterStaffUserInsertOutcomeEnum } from '../../enums/user-register-staff-user-insert-outcome.enum';

export type IUserRegisterStaffRoleRecord = Pick<StaffRole, 'id'>;

export type IUserRegisterStaffUserInsertRecord =
  | (Pick<StaffUser, 'id'> & { outcome: UserRegisterStaffUserInsertOutcomeEnum.INSERTED })
  | { outcome: UserRegisterStaffUserInsertOutcomeEnum.DUPLICATE };
