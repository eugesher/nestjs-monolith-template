import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { CACHE_KEYS, CACHE_PORT, type ICachePort } from '@acme-libs/contracts/cache';

import {
  IReminderSummaryPort,
  IReminderSummaryReadCommand,
  IReminderSummarySnapshotView,
  REMINDER_CACHE_TTL_MS_DEFAULT_TOKEN,
  REMINDER_SUMMARY_PORT,
} from '../../outbound';

@Injectable()
export class ReminderSummaryCacheAdapter implements IReminderSummaryPort {
  public static readonly provider: ClassProvider<IReminderSummaryPort> = {
    provide: REMINDER_SUMMARY_PORT,
    useClass: ReminderSummaryCacheAdapter,
  };

  constructor(
    @Inject(REMINDER_CACHE_TTL_MS_DEFAULT_TOKEN)
    private readonly ttlMs: number,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  public async read(command: IReminderSummaryReadCommand): Promise<IReminderSummarySnapshotView> {
    const { ownerId, compute } = command;
    const key = CACHE_KEYS.reminderSummary(ownerId);

    return await this.cache.wrap(key, this.ttlMs, compute);
  }

  public async invalidate(ownerId: string): Promise<void> {
    const prefix = CACHE_KEYS.reminderSummaryPrefix(ownerId);

    await this.cache.delByPrefix(prefix);
  }
}
