export interface IAuthCommonStaffUserRecord {
  id: string;
  email: string;
  userRoles: { role: { name: string } }[];
}
