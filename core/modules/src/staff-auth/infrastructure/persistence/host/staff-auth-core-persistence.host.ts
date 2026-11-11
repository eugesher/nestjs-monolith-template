import { StaffUser } from '@acme-core/entities';
import type { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';

import { StaffAuthCorePersistenceStaffUserBuilder } from '../builders/staff-auth-core-persistence-staff-user.builder';

export abstract class StaffAuthCorePersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get staffUserRepository(): IHostedRepository<StaffUser> {
    return this.orm.getRepository(StaffUser);
  }

  protected createStaffUserBuilder(): StaffAuthCorePersistenceStaffUserBuilder {
    return new StaffAuthCorePersistenceStaffUserBuilder(
      this.staffUserRepository.createQueryBuilder(StaffUser.name),
    );
  }
}
