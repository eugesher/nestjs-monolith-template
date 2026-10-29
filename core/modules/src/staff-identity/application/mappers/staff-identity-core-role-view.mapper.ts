import { IStaffIdentityCoreRoleView } from '@acme-core/contracts/staff-identity';
import { StaffIdentityCoreRoleModel } from '../../domain';

export class StaffIdentityCoreRoleViewMapper {
  public static toView(role: StaffIdentityCoreRoleModel): IStaffIdentityCoreRoleView {
    return { name: role.name, permissionCodes: [...role.permissionCodes] };
  }
}
