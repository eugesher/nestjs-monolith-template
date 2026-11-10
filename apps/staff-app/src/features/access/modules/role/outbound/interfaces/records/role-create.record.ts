import { StaffRole } from '@acme-core/entities';

import { RoleCreateStaffRoleInsertOutcomeEnum } from '../../enums/role-create-staff-role-insert-outcome.enum';

export type IRoleCreateStaffRoleInsertRecord =
  | (Pick<StaffRole, 'id'> & { outcome: RoleCreateStaffRoleInsertOutcomeEnum.INSERTED })
  | { outcome: RoleCreateStaffRoleInsertOutcomeEnum.DUPLICATE };
