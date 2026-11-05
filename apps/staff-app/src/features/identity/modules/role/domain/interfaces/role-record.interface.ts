export interface IRoleRecord {
  id: string;
  name: string;
  rolePermissions: { permission: { code: string } }[];
}
