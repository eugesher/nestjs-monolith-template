import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { RoleEnum } from '@acme-libs/kernel';
import { MysqlErrorHelper } from '@acme-libs/toolkit';
import { StaffRole, StaffUser, StaffUserRole } from '@acme-staff/common/entities';

import { AuthEmailTakenException, IUserStaffUserDraft, UserStaffUserModel } from '../../../domain';
import { IUserRegisterRepositoryPort } from '../../../outbound';

@Injectable()
export class UserRegisterRepository implements IUserRegisterRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get staffRoleRepository(): IHostedRepository<StaffRole> {
    return this.repositoryHost.getRepository(StaffRole);
  }

  private get staffUserRoleRepository(): IHostedRepository<StaffUserRole> {
    return this.repositoryHost.getRepository(StaffUserRole);
  }

  private get staffUserRepository(): IHostedRepository<StaffUser> {
    return this.repositoryHost.getRepository(StaffUser);
  }

  public async insert(draft: IUserStaffUserDraft): Promise<UserStaffUserModel> {
    const { email, passwordHash, status, roles } = draft;
    const id = await this.insertRow(draft);

    await this.insertRoles(id, roles);

    return UserStaffUserModel.reconstitute({ id, email, passwordHash, status, roles });
  }

  private async insertRow(draft: IUserStaffUserDraft): Promise<string> {
    const { email, passwordHash, status } = draft;

    try {
      return await this.staffUserRepository.insertOne({ email, passwordHash, status });
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        throw new AuthEmailTakenException(email);
      }

      throw error;
    }
  }

  private async insertRoles(userId: string, names: RoleEnum[]): Promise<void> {
    if (names.length === 0) {
      return;
    }

    const roles = await this.staffRoleRepository
      .createQueryBuilder('StaffRole')
      .select(['StaffRole.id'])
      .where('StaffRole.name IN (:...names)', { names })
      .getMany();
    const rows = roles.map((role) => ({ userId, roleId: role.id }));

    await this.staffUserRoleRepository.insert(rows);
  }
}
