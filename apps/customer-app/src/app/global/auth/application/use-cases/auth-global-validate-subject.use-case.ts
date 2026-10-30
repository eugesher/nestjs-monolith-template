import { Inject, Injectable } from '@nestjs/common';

import { UserStatusEnum } from '@acme-libs/kernel';
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
    const customer = await this.repository.findById(customerId);

    if (customer?.status !== UserStatusEnum.ACTIVE) {
      return undefined;
    }

    return { id: customer.id, email: customer.email };
  }
}
