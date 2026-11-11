import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import type { Nullable } from '@acme-libs/toolkit';

import {
  AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT,
  type IAuthGlobalValidateSubjectCustomerRecord,
  type IAuthGlobalValidateSubjectRepositoryPort,
} from '../../../outbound';
import { AuthGlobalPersistenceHost } from '../host/auth-global-persistence.host';

@Injectable()
export class AuthGlobalValidateSubjectRepository
  extends AuthGlobalPersistenceHost
  implements IAuthGlobalValidateSubjectRepositoryPort
{
  public static readonly provider: ClassProvider<IAuthGlobalValidateSubjectRepositoryPort> = {
    provide: AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT,
    useClass: AuthGlobalValidateSubjectRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findActiveById(
    id: string,
  ): Promise<Nullable<IAuthGlobalValidateSubjectCustomerRecord>> {
    return await this.createCustomerBuilder().forActiveById(id).getOne();
  }
}
