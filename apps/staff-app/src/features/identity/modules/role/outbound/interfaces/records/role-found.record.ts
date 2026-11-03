interface IRoleFoundRecordPermission {
  code: string;
}

interface IRoleFoundRecordRolePermission {
  permission: IRoleFoundRecordPermission;
}

export interface IRoleFoundRecord {
  id: string;
  name: string;
  rolePermissions: IRoleFoundRecordRolePermission[];
}
