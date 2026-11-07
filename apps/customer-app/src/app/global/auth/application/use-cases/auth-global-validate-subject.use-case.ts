import { Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';

import {
  AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT,
  type IAuthGlobalValidateSubjectRepositoryPort,
} from '../../outbound';
import { IAuthGlobalValidateSubjectCommand, IAuthGlobalValidateSubjectView } from '../interfaces';

@Injectable()
export class AuthGlobalValidateSubjectUseCase {
  constructor(
    @Inject(AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT)
    private readonly repository: IAuthGlobalValidateSubjectRepositoryPort,
  ) {}

  public async execute(
    command: IAuthGlobalValidateSubjectCommand,
  ): Promise<Nullable<IAuthGlobalValidateSubjectView>> {
    const { customerId } = command;

    return await this.repository.findActiveById(customerId);
  }
}
