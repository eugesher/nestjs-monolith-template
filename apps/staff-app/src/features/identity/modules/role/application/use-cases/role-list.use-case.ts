import { Inject, Injectable } from '@nestjs/common';

import { ROLE_LIST_REPOSITORY_PORT, type IRoleListRepositoryPort } from '../../outbound';
import { IRoleView } from '../interfaces';
import { RoleViewMapper } from '../mappers/role-view.mapper';

@Injectable()
export class RoleListUseCase {
  constructor(
    @Inject(ROLE_LIST_REPOSITORY_PORT)
    private readonly repository: IRoleListRepositoryPort,
  ) {}

  public async execute(): Promise<IRoleView[]> {
    const roles = await this.repository.list();

    return roles.map((role) => RoleViewMapper.toView(role));
  }
}
