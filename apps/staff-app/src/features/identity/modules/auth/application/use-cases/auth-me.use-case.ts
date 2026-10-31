import { Inject, Injectable } from '@nestjs/common';

import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { AuthDomainException } from '../../domain';
import { type IAuthIdentityPort, AUTH_IDENTITY_PORT } from '../../outbound';
import { IAuthMeQuery, IAuthMeView } from '../interfaces';

@Injectable()
export class AuthMeUseCase {
  constructor(
    @Inject(AUTH_IDENTITY_PORT)
    private readonly identity: IAuthIdentityPort,
  ) {}

  public async execute(query: IAuthMeQuery): Promise<IAuthMeView> {
    const { userId } = query;
    const subject = await this.identity.findSubject({ userId });

    if (!subject) {
      throw new AuthDomainException(
        IdentityErrorCodeEnum.AUTH_USER_NOT_FOUND,
        `User ${userId} was not found`,
      );
    }

    const { id, email, roles } = subject;

    return { id, email, roles };
  }
}
