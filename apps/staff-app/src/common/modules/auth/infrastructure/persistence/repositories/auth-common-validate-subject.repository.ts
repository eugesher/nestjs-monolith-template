import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { StaffUser } from '@acme-core/entities';
import { UserStatusEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { AuthCommonStaffUserModel } from '../../../domain';
import { type IAuthCommonValidateSubjectRepositoryPort } from '../../../outbound';
import { AuthCommonStaffUserMapper } from '../mappers/auth-common-staff-user.mapper';

@Injectable()
export class AuthCommonValidateSubjectRepository implements IAuthCommonValidateSubjectRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get staffUserRepository(): Repository<StaffUser> {
    return this.transactionHost.tx.getRepository(StaffUser);
  }

  public async findActiveById(id: string): Promise<Maybe<AuthCommonStaffUserModel>> {
    const user = await this.staffUserRepository.findOne({
      where: { id, status: UserStatusEnum.ACTIVE },
      relations: { userRoles: { role: true } },
    });

    return user ? AuthCommonStaffUserMapper.toModel(user) : undefined;
  }
}
