import { StaffPermission, StaffRole } from '@acme-staff/common/entities';

type IRoleListRecordItemPermission = Pick<StaffPermission, 'code'>;

interface IRoleListRecordItemRolePermission {
  permission: IRoleListRecordItemPermission;
}

interface IRoleListRecordItem extends Pick<StaffRole, 'id' | 'name'> {
  rolePermissions: IRoleListRecordItemRolePermission[];
}

export type IRoleListRecord = IRoleListRecordItem[];
