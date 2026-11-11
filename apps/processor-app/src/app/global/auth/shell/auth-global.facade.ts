import { Injectable } from '@nestjs/common';

import type { Nullable } from '@acme-libs/toolkit';
import type {
  IAuthCurrentUserView,
  IAuthJwtPayloadCommand,
  IAuthUserValidatorPort,
} from '@acme-libs/contracts/auth';

import { AuthGlobalValidateSubjectUseCase } from '../application';

@Injectable()
export class AuthGlobalFacade implements IAuthUserValidatorPort {
  constructor(private readonly validateSubject: AuthGlobalValidateSubjectUseCase) {}

  public async handleValidate(
    command: IAuthJwtPayloadCommand,
  ): Promise<Nullable<IAuthCurrentUserView>> {
    const { sub } = command;

    return await this.validateSubject.execute({ userId: sub });
  }
}
