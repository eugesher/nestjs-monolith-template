import { IIdentityCoreRoleView } from '@acme-core/contracts/identity';
import { IdentityCoreRoleModel } from '../../domain';

export class IdentityCoreRoleViewMapper {
  public static toView(role: IdentityCoreRoleModel): IIdentityCoreRoleView {
    return { name: role.name, permissionCodes: [...role.permissionCodes] };
  }
}
