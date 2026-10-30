import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { StaffRole } from '@acme-core/entities';
import { StaffIdentityCommonRoleModel } from '../../../domain';
import { type IStaffIdentityCommonListRolesRepositoryPort } from '../../../outbound';
import { StaffIdentityCommonRoleMapper } from '../mappers/staff-identity-common-role.mapper';

@Injectable()
export class StaffIdentityCommonListRolesRepository implements IStaffIdentityCommonListRolesRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get roles(): Repository<StaffRole> {
    return this.txHost.tx.getRepository(StaffRole);
  }

  public async list(): Promise<StaffIdentityCommonRoleModel[]> {
    const roles = await this.roles.find({
      relations: { rolePermissions: { permission: true } },
      order: { id: 'ASC' },
    });

    return roles.map((role) => StaffIdentityCommonRoleMapper.toModel(role));
  }
}
