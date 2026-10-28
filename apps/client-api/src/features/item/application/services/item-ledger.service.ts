import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { ReplayRetryHelper } from '@acme-libs/toolkit';
import { ItemArchivedEvent } from '../../domain';
import { type IItemLedgerPort, ITEM_LEDGER_PORT } from '../../outbound';
import { IItemLedgerRecordArchivedCommand } from '../interfaces/commands/item-ledger-record-archived.command';

@Injectable()
export class ItemLedgerService {
  private static readonly LEDGER_APPEND_ATTEMPTS = 3;

  constructor(
    @Inject(ITEM_LEDGER_PORT)
    private readonly ledger: IItemLedgerPort,
    @InjectPinoLogger(ItemLedgerService.name)
    private readonly logger: PinoLogger,
  ) {}

  public async recordArchived(command: IItemLedgerRecordArchivedCommand): Promise<void> {
    const { itemId, sku, events } = command;
    const archived = events.filter((event) => event instanceof ItemArchivedEvent);

    for (const event of archived) {
      await this.appendArchived(itemId, sku, event);
    }
  }

  private appendArchived(itemId: string, sku: string, event: ItemArchivedEvent): Promise<void> {
    const operationKey = `item-archived:${itemId}`;
    const occurredAt = event.occurredAt.toISOString();
    const correlationId = CorrelationContextHelper.current(ItemLedgerService.name);

    return ReplayRetryHelper.retryThenLogForReplay(
      () =>
        this.ledger.append({
          operationKey,
          subjectType: 'item',
          subjectId: itemId,
          action: 'ItemArchived',
          payload: { sku, previousStatus: event.previousStatus },
          occurredAt,
        }),
      {
        maxAttempts: ItemLedgerService.LEDGER_APPEND_ATTEMPTS,
        logger: this.logger,
        correlationId,
        label: 'Ledger append (item archived)',
        context: { itemId, operationKey },
        replayMessage:
          'Ledger append failed permanently: the item is archived but absent from the ledger, replay this record',
      },
    );
  }
}
