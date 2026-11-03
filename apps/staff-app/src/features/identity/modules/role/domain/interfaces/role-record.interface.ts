interface IRoleRecordPermission {
  code: string;
}

interface IRoleRecordRolePermission {
  permission: IRoleRecordPermission;
}

export interface IRoleRecord {
  id: string;
  name: string;
  rolePermissions: IRoleRecordRolePermission[];
}
