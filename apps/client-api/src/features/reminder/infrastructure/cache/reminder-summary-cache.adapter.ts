import { Inject, Injectable } from '@nestjs/common';

import { CACHE_KEYS, CACHE_PORT, type ICachePort } from '@acme-libs/contracts/cache';
import {
  type IReminderSummaryPort,
  IReminderSummaryReadQuery,
  IReminderSummarySnapshotView,
  REMINDER_SUMMARY_TTL_MS,
} from '../../outbound';

@Injectable()
export class ReminderSummaryCacheAdapter implements IReminderSummaryPort {
  constructor(
    @Inject(REMINDER_SUMMARY_TTL_MS)
    private readonly ttlMs: number,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  public read(query: IReminderSummaryReadQuery): Promise<IReminderSummarySnapshotView> {
    const { ownerId, compute } = query;
    const key = CACHE_KEYS.reminderSummary(ownerId);

    return this.cache.wrap(key, this.ttlMs, compute);
  }

  public async invalidate(ownerId: string): Promise<void> {
    const prefix = CACHE_KEYS.reminderSummaryPrefix(ownerId);

    await this.cache.delByPrefix(prefix);
  }
}
