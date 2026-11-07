import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-core/entities';

import { RolePersistenceStaffPermissionBuilder } from '../builders/role-persistence-staff-permission.builder';
import { RolePersistenceStaffRoleBuilder } from '../builders/role-persistence-staff-role.builder';

export abstract class RolePersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get staffPermissionRepository(): IHostedRepository<StaffPermission> {
    return this.repositoryHost.getRepository(StaffPermission);
  }

  protected get staffRolePermissionRepository(): IHostedRepository<StaffRolePermission> {
    return this.repositoryHost.getRepository(StaffRolePermission);
  }

  protected get staffRoleRepository(): IHostedRepository<StaffRole> {
    return this.repositoryHost.getRepository(StaffRole);
  }

  protected createStaffRoleBuilder(): RolePersistenceStaffRoleBuilder {
    return new RolePersistenceStaffRoleBuilder(
      this.staffRoleRepository.createQueryBuilder(StaffRole.name),
    );
  }

  protected createStaffPermissionBuilder(): RolePersistenceStaffPermissionBuilder {
    return new RolePersistenceStaffPermissionBuilder(
      this.staffPermissionRepository.createQueryBuilder(StaffPermission.name),
    );
  }
}
