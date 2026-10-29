import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { ReplayRetryHelper } from '@acme-libs/toolkit';
import { ProductArchivedEvent } from '../../domain';
import { type IProductLedgerPort, PRODUCT_LEDGER_PORT } from '../../outbound';
import { IProductLedgerRecordArchivedCommand } from '../interfaces/commands/product-ledger-record-archived.command';

@Injectable()
export class ProductLedgerService {
  private static readonly LEDGER_APPEND_ATTEMPTS = 3;

  constructor(
    @Inject(PRODUCT_LEDGER_PORT)
    private readonly ledger: IProductLedgerPort,
    @InjectPinoLogger(ProductLedgerService.name)
    private readonly logger: PinoLogger,
  ) {}

  public async recordArchived(command: IProductLedgerRecordArchivedCommand): Promise<void> {
    const { productId, events } = command;
    const archived = events.filter((event) => event instanceof ProductArchivedEvent);

    for (const event of archived) {
      await this.appendArchived(productId, event);
    }
  }

  private appendArchived(productId: string, event: ProductArchivedEvent): Promise<void> {
    const { sku, previousStatus } = event;
    const operationKey = `product-archived:${productId}`;
    const occurredAt = event.occurredAt.toISOString();
    const correlationId = CorrelationContextHelper.current(ProductLedgerService.name);

    return ReplayRetryHelper.retryThenLogForReplay(
      () =>
        this.ledger.append({
          operationKey,
          subjectType: 'product',
          subjectId: productId,
          action: 'ProductArchived',
          payload: { sku, previousStatus },
          occurredAt,
        }),
      {
        maxAttempts: ProductLedgerService.LEDGER_APPEND_ATTEMPTS,
        logger: this.logger,
        correlationId,
        label: 'Ledger append (product archived)',
        context: { productId, operationKey },
        replayMessage:
          'Ledger append failed permanently: the product is archived but absent from the ledger, replay this record',
      },
    );
  }
}
