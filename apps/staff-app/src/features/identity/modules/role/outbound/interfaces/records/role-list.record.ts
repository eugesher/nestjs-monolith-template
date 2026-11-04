import { StaffPermission, StaffRole } from '@acme-staff/common/entities';

export type IRoleListRecord = Pick<StaffRole, 'id' | 'name'> & {
  rolePermissions: { permission: Pick<StaffPermission, 'code'> }[];
};
