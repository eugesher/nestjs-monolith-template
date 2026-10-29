import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { StaffRole } from '@acme-core/entities';
import { StaffIdentityCoreRoleModel } from '../../../domain';
import { type IStaffIdentityCoreListRolesRepositoryPort } from '../../../outbound';
import { StaffIdentityCoreRoleMapper } from '../mappers/staff-identity-core-role.mapper';

@Injectable()
export class StaffIdentityCoreListRolesRepository implements IStaffIdentityCoreListRolesRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get roles(): Repository<StaffRole> {
    return this.txHost.tx.getRepository(StaffRole);
  }

  public async list(): Promise<StaffIdentityCoreRoleModel[]> {
    const roles = await this.roles.find({
      relations: { rolePermissions: { permission: true } },
      order: { id: 'ASC' },
    });

    return roles.map((role) => StaffIdentityCoreRoleMapper.toModel(role));
  }
}
