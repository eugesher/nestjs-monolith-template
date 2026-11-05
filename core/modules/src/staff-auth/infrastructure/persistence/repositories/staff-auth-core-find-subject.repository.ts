import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { UserStatusEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { StaffUser } from '@acme-core/entities';

import {
  IStaffAuthCoreFindSubjectRepositoryPort,
  IStaffAuthCoreFindSubjectStaffUserRecord,
} from '../../../outbound';

@Injectable()
export class StaffAuthCoreFindSubjectRepository implements IStaffAuthCoreFindSubjectRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get staffUserRepository(): IHostedRepository<StaffUser> {
    return this.repositoryHost.getRepository(StaffUser);
  }

  public async findActiveById(
    id: string,
  ): Promise<Nullable<IStaffAuthCoreFindSubjectStaffUserRecord>> {
    return await this.staffUserRepository
      .createQueryBuilder('StaffUser')
      .select(['StaffUser.id', 'StaffUser.email'])
      .leftJoin('StaffUser.userRoles', 'StaffUserRole')
      .addSelect(['StaffUserRole.userId', 'StaffUserRole.roleId'])
      .leftJoin('StaffUserRole.role', 'StaffRole')
      .addSelect(['StaffRole.id', 'StaffRole.name'])
      .leftJoin('StaffRole.rolePermissions', 'StaffRolePermission')
      .addSelect(['StaffRolePermission.roleId', 'StaffRolePermission.permissionId'])
      .leftJoin('StaffRolePermission.permission', 'StaffPermission')
      .addSelect(['StaffPermission.id', 'StaffPermission.code'])
      .where('StaffUser.id = :id', { id })
      .andWhere('StaffUser.status = :status', { status: UserStatusEnum.ACTIVE })
      .getOne();
  }
}
