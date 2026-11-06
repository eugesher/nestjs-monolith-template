import { Injectable } from '@nestjs/common';

import {
  IAuthCurrentUserView,
  IAuthJwtPayloadCommand,
  IAuthUserValidatorPort,
} from '@acme-libs/contracts/auth';
import { Nullable } from '@acme-libs/toolkit';

import { AuthGlobalValidateSubjectUseCase } from '../application';

@Injectable()
export class AuthGlobalFacade implements IAuthUserValidatorPort {
  constructor(private readonly authGlobalValidateSubject: AuthGlobalValidateSubjectUseCase) {}

  public async validate(command: IAuthJwtPayloadCommand): Promise<Nullable<IAuthCurrentUserView>> {
    const { sub } = command;

    return await this.authGlobalValidateSubject.execute({ customerId: sub });
  }
}
