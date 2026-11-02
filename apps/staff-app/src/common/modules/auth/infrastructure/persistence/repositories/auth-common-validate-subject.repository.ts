import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { UserStatusEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { StaffUser } from '@acme-staff/common/entities';

import { AuthCommonStaffUserModel } from '../../../domain';
import { type IAuthCommonValidateSubjectRepositoryPort } from '../../../outbound';
import { AuthCommonStaffUserMapper } from '../mappers/auth-common-staff-user.mapper';

@Injectable()
export class AuthCommonValidateSubjectRepository implements IAuthCommonValidateSubjectRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get staffUserRepository(): Repository<StaffUser> {
    return this.repositoryHost.getRepository(StaffUser);
  }

  public async findActiveById(id: string): Promise<Nullable<AuthCommonStaffUserModel>> {
    const user = await this.staffUserRepository.findOne({
      where: { id, status: UserStatusEnum.ACTIVE },
      relations: { userRoles: { role: true } },
    });

    return user ? AuthCommonStaffUserMapper.toModel(user) : null;
  }
}
