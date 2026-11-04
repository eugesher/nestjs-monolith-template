import { Inject, Injectable } from '@nestjs/common';

import { AuthUserNotFoundException } from '../../domain';
import { type IAuthIdentityPort, AUTH_IDENTITY_PORT } from '../../outbound';
import { IAuthMeCommand, IAuthMeView } from '../interfaces';

@Injectable()
export class AuthMeUseCase {
  constructor(
    @Inject(AUTH_IDENTITY_PORT)
    private readonly identity: IAuthIdentityPort,
  ) {}

  public async execute(command: IAuthMeCommand): Promise<IAuthMeView> {
    const { userId } = command;
    const subject = await this.identity.findSubject({ userId });

    if (!subject) {
      throw new AuthUserNotFoundException(userId);
    }

    return subject;
  }
}
