import { StaffPermission, StaffRole, StaffUser } from '@acme-core/entities';

export type IStaffAuthCoreFindSubjectStaffUserRecord = Pick<StaffUser, 'id' | 'email'> & {
  userRoles: {
    role: Pick<StaffRole, 'name'> & {
      rolePermissions: { permission: Pick<StaffPermission, 'code'> }[];
    };
  }[];
};
