import { IRoleView } from '../interfaces';
import { RoleModel } from '../../domain';

export class RoleViewMapper {
  public static toView(role: RoleModel): IRoleView {
    return { name: role.name, permissionCodes: [...role.permissionCodes] };
  }
}
