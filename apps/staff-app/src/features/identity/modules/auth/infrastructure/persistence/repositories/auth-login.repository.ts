import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { Nullable } from '@acme-libs/toolkit';
import { StaffUser } from '@acme-staff/common/entities';

import { AuthStaffUserModel } from '../../../domain';
import { type IAuthLoginRepositoryPort } from '../../../outbound';
import { AuthStaffUserMapper } from '../mappers/auth-staff-user.mapper';

@Injectable()
export class AuthLoginRepository implements IAuthLoginRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get staffUserRepository(): Repository<StaffUser> {
    return this.repositoryHost.getRepository(StaffUser);
  }

  public async findByEmail(email: string): Promise<Nullable<AuthStaffUserModel>> {
    const user = await this.staffUserRepository.findOne({ where: { email } });

    return user ? AuthStaffUserMapper.toModel(user) : null;
  }
}
