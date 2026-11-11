import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  ROLE_LIST_REPOSITORY_PORT,
  type IRoleListRecord,
  type IRoleListRepositoryPort,
} from '../../../outbound';
import { RolePersistenceHost } from '../host/role-persistence.host';

@Injectable()
export class RoleListRepository extends RolePersistenceHost implements IRoleListRepositoryPort {
  public static readonly provider: ClassProvider<IRoleListRepositoryPort> = {
    provide: ROLE_LIST_REPOSITORY_PORT,
    useClass: RoleListRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async list(): Promise<IRoleListRecord[]> {
    return await this.createStaffRoleBuilder().forList().getMany();
  }
}
