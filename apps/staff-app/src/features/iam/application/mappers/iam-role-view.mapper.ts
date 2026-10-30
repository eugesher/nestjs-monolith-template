import { IIamRoleView } from '../interfaces';
import { IamRoleModel } from '../../domain';

export class IamRoleViewMapper {
  public static toView(role: IamRoleModel): IIamRoleView {
    return { name: role.name, permissionCodes: [...role.permissionCodes] };
  }
}
