import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import {
  IAuthGlobalValidateSubjectCustomerRecord,
  IAuthGlobalValidateSubjectRepositoryPort,
  AUTH_GLOBAL_VALIDATE_SUBJECT_REPOSITORY_PORT,
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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findActiveById(
    id: string,
  ): Promise<Nullable<IAuthGlobalValidateSubjectCustomerRecord>> {
    return await this.createCustomerBuilder().forActiveById(id).getOne();
  }
}
