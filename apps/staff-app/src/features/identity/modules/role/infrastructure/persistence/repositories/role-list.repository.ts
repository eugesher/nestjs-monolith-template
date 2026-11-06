import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { IRoleListRecord, IRoleListRepositoryPort } from '../../../outbound';
import { RolePersistenceHost } from '../host/role-persistence.host';

@Injectable()
export class RoleListRepository extends RolePersistenceHost implements IRoleListRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async list(): Promise<IRoleListRecord[]> {
    return await this.createStaffRoleBuilder().forList().getMany();
  }
}
