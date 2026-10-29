import { Inject, Injectable } from '@nestjs/common';

import { IAM_IDENTITY_PORT, type IIamIdentityPort } from '../../outbound';
import { IIamRoleView, IIamUpdateRolePermissionsCommand } from '../interfaces';

@Injectable()
export class IamUpdateRolePermissionsUseCase {
  constructor(
    @Inject(IAM_IDENTITY_PORT)
    private readonly identity: IIamIdentityPort,
  ) {}

  public execute(command: IIamUpdateRolePermissionsCommand): Promise<IIamRoleView> {
    const { role, permissionCodes } = command;

    return this.identity.updateRolePermissions({ role, permissionCodes });
  }
}
