interface IRoleListedRecordPermission {
  code: string;
}

interface IRoleListedRecordRolePermission {
  permission: IRoleListedRecordPermission;
}

export interface IRoleListedRecord {
  id: string;
  name: string;
  rolePermissions: IRoleListedRecordRolePermission[];
}
