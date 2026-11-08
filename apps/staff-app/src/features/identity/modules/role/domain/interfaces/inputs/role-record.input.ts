export interface IRoleRecordInput {
  id: string;
  name: string;
  rolePermissions: { permission: { code: string } }[];
}
