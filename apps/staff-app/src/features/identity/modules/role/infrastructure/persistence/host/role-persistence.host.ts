import { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';
import { StaffRole, StaffRolePermission } from '@acme-core/entities';

import { RolePersistenceStaffRoleBuilder } from '../builders/role-persistence-staff-role.builder';

export abstract class RolePersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get staffRolePermissionRepository(): IHostedRepository<StaffRolePermission> {
    return this.orm.getRepository(StaffRolePermission);
  }

  protected get staffRoleRepository(): IHostedRepository<StaffRole> {
    return this.orm.getRepository(StaffRole);
  }

  protected createStaffRoleBuilder(): RolePersistenceStaffRoleBuilder {
    return new RolePersistenceStaffRoleBuilder(
      this.staffRoleRepository.createQueryBuilder(StaffRole.name),
    );
  }
}
