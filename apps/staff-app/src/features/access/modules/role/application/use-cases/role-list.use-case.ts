import { Inject, Injectable } from '@nestjs/common';

import { RoleModel } from '../../domain';
import { ROLE_LIST_REPOSITORY_PORT, type IRoleListRepositoryPort } from '../../outbound';
import type { IRoleView } from '../interfaces';

@Injectable()
export class RoleListUseCase {
  constructor(
    @Inject(ROLE_LIST_REPOSITORY_PORT)
    private readonly repository: IRoleListRepositoryPort,
  ) {}

  public async execute(): Promise<IRoleView[]> {
    const roleRecords = await this.repository.list();

    return roleRecords.map((record) => {
      const role = RoleModel.reconstitute(record);

      return role.toSnapshot();
    });
  }
}
