import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { CACHE_KEYS, CACHE_LIB_PORT, type ICacheLibPort } from '@acme-libs/contracts/cache';

import {
  REMINDER_SUMMARY_PORT,
  type IReminderSummaryPort,
  type IReminderSummaryReadCommand,
  type IReminderSummarySnapshotView,
} from '../../outbound';

@Injectable()
export class ReminderSummaryCacheAdapter implements IReminderSummaryPort {
  public static readonly provider: ClassProvider<IReminderSummaryPort> = {
    provide: REMINDER_SUMMARY_PORT,
    useClass: ReminderSummaryCacheAdapter,
  };

  constructor(
    @Inject(CACHE_LIB_PORT)
    private readonly cache: ICacheLibPort,
  ) {}

  public async read(command: IReminderSummaryReadCommand): Promise<IReminderSummarySnapshotView> {
    const { ownerId, ttlMs, compute } = command;
    const key = CACHE_KEYS.reminderSummary(ownerId);

    return await this.cache.handleWrap({ key, ttlMs, compute });
  }

  public async invalidate(ownerId: string): Promise<void> {
    const prefix = CACHE_KEYS.reminderSummaryPrefix(ownerId);

    await this.cache.handleDelByPrefix(prefix);
  }
}
