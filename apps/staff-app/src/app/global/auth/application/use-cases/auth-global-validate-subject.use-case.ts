import { Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';

import { AUTH_GLOBAL_SUBJECT_PORT, type IAuthGlobalSubjectPort } from '../../outbound';
import { IAuthGlobalSubjectView, IAuthGlobalValidateSubjectCommand } from '../interfaces';

@Injectable()
export class AuthGlobalValidateSubjectUseCase {
  constructor(
    @Inject(AUTH_GLOBAL_SUBJECT_PORT)
    private readonly subject: IAuthGlobalSubjectPort,
  ) {}

  public async execute(
    command: IAuthGlobalValidateSubjectCommand,
  ): Promise<Nullable<IAuthGlobalSubjectView>> {
    const { userId } = command;
    const user = await this.subject.findSubject(userId);

    return user ? { id: user.id, email: user.email } : null;
  }
}
