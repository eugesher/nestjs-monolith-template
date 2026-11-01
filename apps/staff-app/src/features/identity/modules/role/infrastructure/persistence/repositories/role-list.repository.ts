import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { StaffRole } from '@acme-staff/common/entities';

import { RoleModel } from '../../../domain';
import { type IRoleListRepositoryPort } from '../../../outbound';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class RoleListRepository implements IRoleListRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get staffRoleRepository(): Repository<StaffRole> {
    return this.repositoryHost.getRepository(StaffRole);
  }

  public async list(): Promise<RoleModel[]> {
    const roles = await this.staffRoleRepository.find({
      relations: { rolePermissions: { permission: true } },
      order: { id: 'ASC' },
    });

    return roles.map((role) => RoleMapper.toModel(role));
  }
}
