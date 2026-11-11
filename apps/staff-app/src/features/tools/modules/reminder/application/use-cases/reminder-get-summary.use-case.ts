import { Inject, Injectable } from '@nestjs/common';

import {
  REMINDER_CACHE_TTL_MS_DEFAULT_TOKEN,
  REMINDER_GET_SUMMARY_REPOSITORY_PORT,
  REMINDER_SUMMARY_PORT,
  type IReminderGetSummaryRepositoryPort,
  type IReminderSummaryPort,
} from '../../outbound';
import type { IReminderGetSummaryCommand, IReminderGetSummaryView } from '../interfaces';

@Injectable()
export class ReminderGetSummaryUseCase {
  constructor(
    @Inject(REMINDER_GET_SUMMARY_REPOSITORY_PORT)
    private readonly repository: IReminderGetSummaryRepositoryPort,
    @Inject(REMINDER_SUMMARY_PORT)
    private readonly summary: IReminderSummaryPort,
    @Inject(REMINDER_CACHE_TTL_MS_DEFAULT_TOKEN)
    private readonly summaryTtlMs: number,
  ) {}

  public async execute(command: IReminderGetSummaryCommand): Promise<IReminderGetSummaryView> {
    const { ownerId } = command;

    return await this.summary.read({
      ownerId,
      ttlMs: this.summaryTtlMs,
      compute: () => this.summarize(ownerId),
    });
  }

  private async summarize(ownerId: string): Promise<IReminderGetSummaryView> {
    const snapshot = await this.repository.summarize(ownerId);

    return { pending: Number(snapshot?.pending ?? 0), nextDueOn: snapshot?.nextDueOn ?? null };
  }
}
