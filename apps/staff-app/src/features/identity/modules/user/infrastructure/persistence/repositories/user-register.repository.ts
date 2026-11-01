import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';

import { MysqlErrorHelper, RepositoryHost } from '@acme-libs/database';
import { IdentityErrorCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { StaffRole, StaffUser, StaffUserRole } from '@acme-staff/common/entities';

import { IUserStaffUserDraft, UserDomainException, UserStaffUserModel } from '../../../domain';
import { type IUserRegisterRepositoryPort } from '../../../outbound';

@Injectable()
export class UserRegisterRepository implements IUserRegisterRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get staffRoleRepository(): Repository<StaffRole> {
    return this.repositoryHost.getRepository(StaffRole);
  }

  private get staffUserRoleRepository(): Repository<StaffUserRole> {
    return this.repositoryHost.getRepository(StaffUserRole);
  }

  private get staffUserRepository(): Repository<StaffUser> {
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
      const result = await this.staffUserRepository.insert({ email, passwordHash, status });
      const [identifier] = result.identifiers as { id: number | string }[];

      return String(identifier.id);
    } catch (error) {
      if (!MysqlErrorHelper.isDuplicateKey(error)) {
        throw error;
      }

      throw new UserDomainException(
        IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
        `Email ${email} is already registered`,
      );
    }
  }

  private async insertRoles(userId: string, names: RoleEnum[]): Promise<void> {
    if (names.length === 0) {
      return;
    }

    const roles = await this.staffRoleRepository.find({
      select: { id: true },
      where: { name: In(names) },
    });
    const rows = roles.map((role) => ({ userId, roleId: role.id }));

    await this.staffUserRoleRepository.insert(rows);
  }
}
