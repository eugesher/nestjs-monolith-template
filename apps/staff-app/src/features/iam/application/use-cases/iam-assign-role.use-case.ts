import { Inject, Injectable } from '@nestjs/common';

import { IAM_IDENTITY_PORT, type IIamIdentityPort } from '../../outbound';
import { IIamAssignRoleCommand, IIamAssignRoleView } from '../interfaces';

@Injectable()
export class IamAssignRoleUseCase {
  constructor(
    @Inject(IAM_IDENTITY_PORT)
    private readonly identity: IIamIdentityPort,
  ) {}

  public execute(command: IIamAssignRoleCommand): Promise<IIamAssignRoleView> {
    const { userId, role } = command;

    return this.identity.assignRole({ userId, role });
  }
}
