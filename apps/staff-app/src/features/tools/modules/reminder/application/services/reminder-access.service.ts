import { Inject, Injectable } from '@nestjs/common';

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

  public async loadOwned(query: IReminderAccessLoadOwnedQuery): Promise<ReminderModel> {
    const { reminderId, ownerId } = query;
    const reminder = await this.repository.findOwned({ reminderId, ownerId });

    if (reminder === null) {
      throw new ReminderDomainException(
        ReminderErrorCodeEnum.REMINDER_NOT_FOUND,
        `Reminder ${reminderId} was not found`,
      );
    }

    return reminder;
  }
}
