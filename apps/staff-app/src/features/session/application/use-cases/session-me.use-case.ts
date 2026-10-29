import { Inject, Injectable } from '@nestjs/common';

import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { SessionDomainException } from '../../domain';
import { type ISessionIdentityPort, SESSION_IDENTITY_PORT } from '../../outbound';
import { ISessionMeQuery, ISessionMeView } from '../interfaces';

@Injectable()
export class SessionMeUseCase {
  constructor(
    @Inject(SESSION_IDENTITY_PORT)
    private readonly identity: ISessionIdentityPort,
  ) {}

  public async execute(query: ISessionMeQuery): Promise<ISessionMeView> {
    const { userId } = query;
    const subject = await this.identity.findSubject({ userId });

    if (!subject) {
      throw new SessionDomainException(
        IdentityErrorCodeEnum.AUTH_USER_NOT_FOUND,
        `User ${userId} was not found`,
      );
    }

    const { id, email, roles } = subject;

    return { id, email, roles };
  }
}
