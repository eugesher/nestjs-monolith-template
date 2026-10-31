import { Inject, Injectable } from '@nestjs/common';

import { Maybe } from '@acme-libs/toolkit';
import {
  AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT,
  type IAuthGlobalValidateSubjectRepositoryPort,
} from '../../outbound';
import { IAuthGlobalSubjectView, IAuthGlobalValidateSubjectQuery } from '../interfaces';

@Injectable()
export class AuthGlobalValidateSubjectUseCase {
  constructor(
    @Inject(AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT)
    private readonly repository: IAuthGlobalValidateSubjectRepositoryPort,
  ) {}

  public async execute(
    query: IAuthGlobalValidateSubjectQuery,
  ): Promise<Maybe<IAuthGlobalSubjectView>> {
    const { customerId } = query;

    return await this.repository.findActiveById(customerId);
  }
}
