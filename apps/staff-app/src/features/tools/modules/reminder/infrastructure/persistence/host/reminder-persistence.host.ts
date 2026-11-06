import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Reminder } from '@acme-staff/common/entities';
import { ReminderPersistenceBuilder } from '../builders/reminder-persistence.builder';

export abstract class ReminderPersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get reminderRepository(): IHostedRepository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  protected createReminderBuilder(): ReminderPersistenceBuilder {
    return new ReminderPersistenceBuilder(
      this.reminderRepository.createQueryBuilder(Reminder.name),
    );
  }
}
