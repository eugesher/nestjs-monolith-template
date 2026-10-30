import { Inject, Injectable } from '@nestjs/common';

import {
  type IReminderGetSummaryRepositoryPort,
  type IReminderSummaryPort,
  REMINDER_GET_SUMMARY_REPOSITORY_PORT,
  REMINDER_SUMMARY_PORT,
} from '../../outbound';
import { IReminderGetSummaryQuery, IReminderSummaryView } from '../interfaces';

@Injectable()
export class ReminderGetSummaryUseCase {
  constructor(
    @Inject(REMINDER_GET_SUMMARY_REPOSITORY_PORT)
    private readonly repository: IReminderGetSummaryRepositoryPort,
    @Inject(REMINDER_SUMMARY_PORT)
    private readonly summary: IReminderSummaryPort,
  ) {}

  public async execute(query: IReminderGetSummaryQuery): Promise<IReminderSummaryView> {
    const { ownerId } = query;
    const snapshot = await this.summary.read({
      ownerId,
      compute: () => this.repository.summarize(ownerId),
    });

    return { pending: snapshot.pending, nextDueOn: snapshot.nextDueOn };
  }
}
