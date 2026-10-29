import { Inject, Injectable } from '@nestjs/common';

import { IAM_IDENTITY_PORT, type IIamIdentityPort } from '../../outbound';
import { IIamRegisterUserCommand, IIamRegisterUserView } from '../interfaces';

@Injectable()
export class IamRegisterUserUseCase {
  constructor(
    @Inject(IAM_IDENTITY_PORT)
    private readonly identity: IIamIdentityPort,
  ) {}

  public execute(command: IIamRegisterUserCommand): Promise<IIamRegisterUserView> {
    const { email, password, roles } = command;

    return this.identity.registerUser({ email, password, roles });
  }
}
