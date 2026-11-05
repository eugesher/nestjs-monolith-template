import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { UserStatusEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { StaffUser } from '@acme-staff/common/entities';

import {
  IAuthCommonValidateSubjectStaffUserRecord,
  IAuthCommonValidateSubjectRepositoryPort,
} from '../../../outbound';

@Injectable()
export class AuthCommonValidateSubjectRepository implements IAuthCommonValidateSubjectRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get staffUserRepository(): IHostedRepository<StaffUser> {
    return this.repositoryHost.getRepository(StaffUser);
  }

  public async findActiveById(
    id: string,
  ): Promise<Nullable<IAuthCommonValidateSubjectStaffUserRecord>> {
    return await this.staffUserRepository
      .createQueryBuilder('StaffUser')
      .select(['StaffUser.id', 'StaffUser.email'])
      .leftJoin('StaffUser.userRoles', 'StaffUserRole')
      .addSelect(['StaffUserRole.userId', 'StaffUserRole.roleId'])
      .leftJoin('StaffUserRole.role', 'StaffRole')
      .addSelect(['StaffRole.id', 'StaffRole.name'])
      .where('StaffUser.id = :id', { id })
      .andWhere('StaffUser.status = :status', { status: UserStatusEnum.ACTIVE })
      .getOne();
  }
}
