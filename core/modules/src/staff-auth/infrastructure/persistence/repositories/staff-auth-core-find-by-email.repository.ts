import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { StaffUser } from '@acme-core/entities';

import {
  IStaffAuthCoreFindByEmailRepositoryPort,
  IStaffAuthCoreFindByEmailStaffUserRecord,
} from '../../../outbound';

@Injectable()
export class StaffAuthCoreFindByEmailRepository implements IStaffAuthCoreFindByEmailRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get staffUserRepository(): IHostedRepository<StaffUser> {
    return this.repositoryHost.getRepository(StaffUser);
  }

  public async findByEmail(
    email: string,
  ): Promise<Nullable<IStaffAuthCoreFindByEmailStaffUserRecord>> {
    return await this.staffUserRepository
      .createQueryBuilder('StaffUser')
      .select(['StaffUser.id', 'StaffUser.passwordHash', 'StaffUser.status'])
      .where('StaffUser.email = :email', { email })
      .getOne();
  }
}
