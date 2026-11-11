import type { StaffRole } from '@acme-core/entities';

import type { RoleCreateStaffRoleInsertOutcomeEnum } from '../../enums/role-create-staff-role-insert-outcome.enum';

export type IRoleCreateStaffRoleInsertRecord =
  | (Pick<StaffRole, 'id'> & { outcome: RoleCreateStaffRoleInsertOutcomeEnum.INSERTED })
  | { outcome: RoleCreateStaffRoleInsertOutcomeEnum.DUPLICATE };
