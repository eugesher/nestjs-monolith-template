import { Inject, Injectable } from '@nestjs/common';

import { ReminderModel, ReminderNotFoundException } from '../../domain';
import {
  type IReminderAccessRepositoryPort,
  REMINDER_ACCESS_REPOSITORY_PORT,
} from '../../outbound';
import { IReminderAccessLoadOwnedQuery } from '../interfaces';

@Injectable()
export class ReminderAccessService {
  constructor(
    @Inject(REMINDER_ACCESS_REPOSITORY_PORT)
    private readonly repository: IReminderAccessRepositoryPort,
  ) {}

  public async loadOwned(query: IReminderAccessLoadOwnedQuery): Promise<ReminderModel> {
    const { reminderId, ownerId } = query;
    const reminder = await this.repository.findOwned({ reminderId, ownerId });

    if (!reminder) {
      throw new ReminderNotFoundException(reminderId);
    }

    return reminder;
  }
}
