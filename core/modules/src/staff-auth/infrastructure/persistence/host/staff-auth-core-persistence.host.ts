import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { StaffUser } from '@acme-core/entities';

import { StaffAuthCorePersistenceStaffUserBuilder } from '../builders/staff-auth-core-persistence-staff-user.builder';

export abstract class StaffAuthCorePersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get staffUserRepository(): IHostedRepository<StaffUser> {
    return this.repositoryHost.getRepository(StaffUser);
  }

  protected createStaffUserBuilder(): StaffAuthCorePersistenceStaffUserBuilder {
    return new StaffAuthCorePersistenceStaffUserBuilder(
      this.staffUserRepository.createQueryBuilder(StaffUser.name),
    );
  }
}
