import { Injectable } from '@nestjs/common';

import {
  IAuthCurrentUserView,
  IAuthJwtPayloadQuery,
  IAuthUserValidatorPort,
} from '@acme-libs-contracts/auth';
import { Nullable } from '@acme-libs-toolkit';

import { AuthGlobalValidateSubjectUseCase } from '../application';

@Injectable()
export class AuthGlobalFacade implements IAuthUserValidatorPort {
  constructor(private readonly authGlobalValidateSubject: AuthGlobalValidateSubjectUseCase) {}

  public async validate(query: IAuthJwtPayloadQuery): Promise<Nullable<IAuthCurrentUserView>> {
    const { sub } = query;

    return await this.authGlobalValidateSubject.execute({ customerId: sub });
  }
}
