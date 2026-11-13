import { Inject, Injectable } from '@nestjs/common';

import { ReminderModel, ReminderNotFoundException } from '../../domain';
import {
  REMINDER_ACCESS_REPOSITORY_PORT,
  type IReminderAccessRepositoryPort,
} from '../../outbound';
import type { IReminderAccessLoadOwnedCommand } from '../interfaces';

@Injectable()
export class ReminderAccessService {
  constructor(
    @Inject(REMINDER_ACCESS_REPOSITORY_PORT)
    private readonly repository: IReminderAccessRepositoryPort,
  ) {}

  public async loadOwned(command: IReminderAccessLoadOwnedCommand): Promise<ReminderModel> {
    const { reminderId, ownerId } = command;
    const reminderRecord = await this.repository.findOwned({ reminderId, ownerId });

    if (!reminderRecord) {
      throw new ReminderNotFoundException(reminderId);
    }

    return ReminderModel.reconstitute(reminderRecord);
  }
}
