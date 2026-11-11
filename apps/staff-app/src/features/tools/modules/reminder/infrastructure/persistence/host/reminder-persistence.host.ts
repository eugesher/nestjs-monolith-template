import { Reminder } from '@acme-staff/common/entities';
import type { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';

import { ReminderPersistenceBuilder } from '../builders/reminder-persistence.builder';

export abstract class ReminderPersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get reminderRepository(): IHostedRepository<Reminder> {
    return this.orm.getRepository(Reminder);
  }

  protected createReminderBuilder(): ReminderPersistenceBuilder {
    return new ReminderPersistenceBuilder(
      this.reminderRepository.createQueryBuilder(Reminder.name),
    );
  }
}
