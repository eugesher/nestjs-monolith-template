import { StaffPermission, StaffRole } from '@acme-staff/common/entities';

type IRoleListRecordItemPermission = Pick<StaffPermission, 'code'>;

interface IRoleListRecordItemRolePermission {
  permission: IRoleListRecordItemPermission;
}

export interface IRoleListRecord extends Pick<StaffRole, 'id' | 'name'> {
  rolePermissions: IRoleListRecordItemRolePermission[];
}
