import { Inject, Injectable } from '@nestjs/common';

import {
  type IReminderGetSummaryRepositoryPort,
  type IReminderSummaryPort,
  REMINDER_GET_SUMMARY_REPOSITORY_PORT,
  REMINDER_SUMMARY_PORT,
} from '../../outbound';
import { IReminderGetSummaryCommand, IReminderGetSummaryView } from '../interfaces';

@Injectable()
export class ReminderGetSummaryUseCase {
  constructor(
    @Inject(REMINDER_GET_SUMMARY_REPOSITORY_PORT)
    private readonly repository: IReminderGetSummaryRepositoryPort,
    @Inject(REMINDER_SUMMARY_PORT)
    private readonly summary: IReminderSummaryPort,
  ) {}

  public async execute(command: IReminderGetSummaryCommand): Promise<IReminderGetSummaryView> {
    const { ownerId } = command;

    return await this.summary.read({
      ownerId,
      compute: () => this.summarize(ownerId),
    });
  }

  private async summarize(ownerId: string): Promise<IReminderGetSummaryView> {
    const snapshot = await this.repository.summarize(ownerId);

    return { pending: Number(snapshot?.pending ?? 0), nextDueOn: snapshot?.nextDueOn ?? null };
  }
}
