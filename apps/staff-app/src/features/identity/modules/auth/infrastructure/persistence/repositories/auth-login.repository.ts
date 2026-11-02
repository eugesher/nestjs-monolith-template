import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { StaffUser } from '@acme-staff/common/entities';

import { AuthStaffUserModel } from '../../../domain';
import { type IAuthLoginRepositoryPort } from '../../../outbound';

@Injectable()
export class AuthLoginRepository implements IAuthLoginRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get staffUserRepository(): Repository<StaffUser> {
    return this.repositoryHost.getRepository(StaffUser);
  }

  public async findByEmail(email: string): Promise<Nullable<AuthStaffUserModel>> {
    const user = await this.staffUserRepository
      .createQueryBuilder('StaffUser')
      .select(['StaffUser.id', 'StaffUser.email', 'StaffUser.passwordHash', 'StaffUser.status'])
      .where('StaffUser.email = :email', { email })
      .getOne();

    if (user === null) {
      return null;
    }

    return AuthStaffUserModel.reconstitute({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status,
    });
  }
}
