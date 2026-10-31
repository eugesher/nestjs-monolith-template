import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { StaffRole } from '@acme-core/entities';
import { RoleModel } from '../../../domain';
import { type IRoleListRepositoryPort } from '../../../outbound';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class RoleListRepository implements IRoleListRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get staffRoleRepository(): Repository<StaffRole> {
    return this.transactionHost.tx.getRepository(StaffRole);
  }

  public async list(): Promise<RoleModel[]> {
    const roles = await this.staffRoleRepository.find({
      relations: { rolePermissions: { permission: true } },
      order: { id: 'ASC' },
    });

    return roles.map((role) => RoleMapper.toModel(role));
  }
}
