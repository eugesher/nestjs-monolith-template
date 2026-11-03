interface IAuthCommonStaffUserRecordRole {
  name: string;
}

interface IAuthCommonStaffUserRecordUserRole {
  role: IAuthCommonStaffUserRecordRole;
}

export interface IAuthCommonStaffUserRecord {
  id: string;
  email: string;
  userRoles: IAuthCommonStaffUserRecordUserRole[];
}
