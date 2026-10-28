import { Inject, Injectable } from '@nestjs/common';

import { IIdentityCoreRoleView } from '@acme-core/contracts/identity';
import {
  IDENTITY_CORE_LIST_ROLES_REPOSITORY_PORT,
  type IIdentityCoreListRolesRepositoryPort,
} from '../../outbound';
import { IdentityCoreRoleViewMapper } from '../mappers/identity-core-role-view.mapper';

@Injectable()
export class IdentityCoreListRolesUseCase {
  constructor(
    @Inject(IDENTITY_CORE_LIST_ROLES_REPOSITORY_PORT)
    private readonly repository: IIdentityCoreListRolesRepositoryPort,
  ) {}

  public async execute(): Promise<IIdentityCoreRoleView[]> {
    const roles = await this.repository.list();

    return roles.map((role) => IdentityCoreRoleViewMapper.toView(role));
  }
}
