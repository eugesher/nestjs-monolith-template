import { Inject, Injectable } from '@nestjs/common';

import { ReminderModel, ReminderNotFoundException } from '../../domain';
import {
  type IReminderAccessRepositoryPort,
  REMINDER_ACCESS_REPOSITORY_PORT,
} from '../../outbound';
import { IReminderAccessLoadOwnedCommand } from '../interfaces';

@Injectable()
export class ReminderAccessService {
  constructor(
    @Inject(REMINDER_ACCESS_REPOSITORY_PORT)
    private readonly repository: IReminderAccessRepositoryPort,
  ) {}

  public async loadOwned(command: IReminderAccessLoadOwnedCommand): Promise<ReminderModel> {
    const { reminderId, ownerId } = command;
    const record = await this.repository.findOwned({ reminderId, ownerId });

    if (!record) {
      throw new ReminderNotFoundException(reminderId);
    }

    return ReminderModel.reconstitute(record);
  }
}
