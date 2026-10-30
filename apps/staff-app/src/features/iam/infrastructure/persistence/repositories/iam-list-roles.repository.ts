import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { StaffRole } from '@acme-core/entities';
import { IamRoleModel } from '../../../domain';
import { type IIamListRolesRepositoryPort } from '../../../outbound';
import { IamRoleMapper } from '../mappers/iam-role.mapper';

@Injectable()
export class IamListRolesRepository implements IIamListRolesRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get roles(): Repository<StaffRole> {
    return this.txHost.tx.getRepository(StaffRole);
  }

  public async list(): Promise<IamRoleModel[]> {
    const roles = await this.roles.find({
      relations: { rolePermissions: { permission: true } },
      order: { id: 'ASC' },
    });

    return roles.map((role) => IamRoleMapper.toModel(role));
  }
}
