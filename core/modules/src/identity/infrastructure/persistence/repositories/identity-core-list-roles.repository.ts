import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Role } from '@acme-core/entities';
import { IdentityCoreRoleModel } from '../../../domain';
import { type IIdentityCoreListRolesRepositoryPort } from '../../../outbound';
import { IdentityCoreRoleMapper } from '../mappers/identity-core-role.mapper';

@Injectable()
export class IdentityCoreListRolesRepository implements IIdentityCoreListRolesRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get roles(): Repository<Role> {
    return this.txHost.tx.getRepository(Role);
  }

  public async list(): Promise<IdentityCoreRoleModel[]> {
    const roles = await this.roles.find({
      relations: { rolePermissions: { permission: true } },
      order: { id: 'ASC' },
    });

    return roles.map((role) => IdentityCoreRoleMapper.toModel(role));
  }
}
