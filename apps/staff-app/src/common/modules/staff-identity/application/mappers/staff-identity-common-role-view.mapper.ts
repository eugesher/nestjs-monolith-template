import { IStaffIdentityCommonRoleView } from '@acme-staff-contracts/staff-identity';
import { StaffIdentityCommonRoleModel } from '../../domain';

export class StaffIdentityCommonRoleViewMapper {
  public static toView(role: StaffIdentityCommonRoleModel): IStaffIdentityCommonRoleView {
    return { name: role.name, permissionCodes: [...role.permissionCodes] };
  }
}
