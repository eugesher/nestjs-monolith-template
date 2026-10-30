import { Inject, Injectable } from '@nestjs/common';

import { IStaffIdentityCommonRoleView } from '@acme-staff-contracts/staff-identity';
import {
  STAFF_IDENTITY_COMMON_LIST_ROLES_REPOSITORY_PORT,
  type IStaffIdentityCommonListRolesRepositoryPort,
} from '../../outbound';
import { StaffIdentityCommonRoleViewMapper } from '../mappers/staff-identity-common-role-view.mapper';

@Injectable()
export class StaffIdentityCommonListRolesUseCase {
  constructor(
    @Inject(STAFF_IDENTITY_COMMON_LIST_ROLES_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCommonListRolesRepositoryPort,
  ) {}

  public async execute(): Promise<IStaffIdentityCommonRoleView[]> {
    const roles = await this.repository.list();

    return roles.map((role) => StaffIdentityCommonRoleViewMapper.toView(role));
  }
}
