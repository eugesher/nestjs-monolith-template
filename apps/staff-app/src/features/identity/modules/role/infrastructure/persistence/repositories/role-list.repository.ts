import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { StaffRole } from '@acme-staff/common/entities';

import { RoleModel } from '../../../domain';
import { type IRoleListRepositoryPort } from '../../../outbound';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class RoleListRepository implements IRoleListRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

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
