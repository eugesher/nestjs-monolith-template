import { Inject, Injectable } from '@nestjs/common';

import { IAM_IDENTITY_PORT, type IIamIdentityPort } from '../../outbound';
import { IIamRoleView } from '../interfaces';

@Injectable()
export class IamListRolesUseCase {
  constructor(
    @Inject(IAM_IDENTITY_PORT)
    private readonly identity: IIamIdentityPort,
  ) {}

  public execute(): Promise<IIamRoleView[]> {
    return this.identity.listRoles();
  }
}
