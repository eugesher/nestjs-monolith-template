import { Inject, Injectable } from '@nestjs/common';

import { OwnershipHelper } from '@acme-libs/toolkit';
import { ReminderDomainException, ReminderErrorCodeEnum, ReminderModel } from '../../domain';
import {
  type IReminderAccessRepositoryPort,
  REMINDER_ACCESS_REPOSITORY_PORT,
} from '../../outbound';
import { IReminderAccessLoadOwnedQuery } from '../interfaces/queries/reminder-access-load-owned.query';

@Injectable()
export class ReminderAccessService {
  constructor(
    @Inject(REMINDER_ACCESS_REPOSITORY_PORT)
    private readonly repository: IReminderAccessRepositoryPort,
  ) {}

  public loadOwned(query: IReminderAccessLoadOwnedQuery): Promise<ReminderModel> {
    const { reminderId, ownerId } = query;

    return OwnershipHelper.loadOwned({
      find: () => this.repository.findById(reminderId),
      owner: (reminder) => reminder.ownerId,
      requiredOwner: ownerId,
      onMissing: () => {
        throw new ReminderDomainException(
          ReminderErrorCodeEnum.REMINDER_NOT_FOUND,
          `Reminder ${reminderId} was not found`,
        );
      },
      onForbidden: () => {
        throw new ReminderDomainException(
          ReminderErrorCodeEnum.REMINDER_ACCESS_FORBIDDEN,
          `Reminder ${reminderId} does not belong to the caller`,
        );
      },
    });
  }
}
