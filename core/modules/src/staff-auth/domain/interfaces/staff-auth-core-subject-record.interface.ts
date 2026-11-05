export interface IStaffAuthCoreSubjectRecord {
  id: string;
  email: string;
  userRoles: { role: { name: string; rolePermissions: { permission: { code: string } }[] } }[];
}
