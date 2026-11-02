import { Inject, Injectable } from '@nestjs/common';

import { ROLE_LIST_REPOSITORY_PORT, type IRoleListRepositoryPort } from '../../outbound';
import { IRoleView } from '../interfaces';

@Injectable()
export class RoleListUseCase {
  constructor(
    @Inject(ROLE_LIST_REPOSITORY_PORT)
    private readonly repository: IRoleListRepositoryPort,
  ) {}

  public async execute(): Promise<IRoleView[]> {
    const roles = await this.repository.list();

    return roles.map((role) => role.toView());
  }
}
