import { Inject, Injectable } from '@nestjs/common';

import { IStaffIdentityCoreRoleView } from '@acme-core/contracts/staff-identity';
import {
  STAFF_IDENTITY_CORE_LIST_ROLES_REPOSITORY_PORT,
  type IStaffIdentityCoreListRolesRepositoryPort,
} from '../../outbound';
import { StaffIdentityCoreRoleViewMapper } from '../mappers/staff-identity-core-role-view.mapper';

@Injectable()
export class StaffIdentityCoreListRolesUseCase {
  constructor(
    @Inject(STAFF_IDENTITY_CORE_LIST_ROLES_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCoreListRolesRepositoryPort,
  ) {}

  public async execute(): Promise<IStaffIdentityCoreRoleView[]> {
    const roles = await this.repository.list();

    return roles.map((role) => StaffIdentityCoreRoleViewMapper.toView(role));
  }
}
