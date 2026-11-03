interface IAuthCommonStaffUserFoundRecordRole {
  name: string;
}

interface IAuthCommonStaffUserFoundRecordUserRole {
  role: IAuthCommonStaffUserFoundRecordRole;
}

export interface IAuthCommonStaffUserFoundRecord {
  id: string;
  email: string;
  userRoles: IAuthCommonStaffUserFoundRecordUserRole[];
}
