import { Inject, Injectable } from '@nestjs/common';

import { Maybe } from '@acme-libs/toolkit';
import { AUTH_GLOBAL_SUBJECT_PORT, type IAuthGlobalSubjectPort } from '../../outbound';
import { IAuthGlobalSubjectView, IAuthGlobalValidateSubjectQuery } from '../interfaces';

@Injectable()
export class AuthGlobalValidateSubjectUseCase {
  constructor(
    @Inject(AUTH_GLOBAL_SUBJECT_PORT)
    private readonly subject: IAuthGlobalSubjectPort,
  ) {}

  public async execute(
    query: IAuthGlobalValidateSubjectQuery,
  ): Promise<Maybe<IAuthGlobalSubjectView>> {
    const { userId } = query;
    const user = await this.subject.findSubject(userId);

    return user ? { id: user.id, email: user.email } : undefined;
  }
}
