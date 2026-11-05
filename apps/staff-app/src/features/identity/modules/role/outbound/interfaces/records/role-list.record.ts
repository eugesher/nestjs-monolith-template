import { StaffPermission, StaffRole } from '@acme-core/entities';

export type IRoleListRecord = Pick<StaffRole, 'id' | 'name'> & {
  rolePermissions: { permission: Pick<StaffPermission, 'code'> }[];
};
