import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs-observability';
import { ReplayRetryHelper } from '@acme-libs-toolkit';

import { ProductStockAddedEvent } from '../../domain';
import {
  type IProductStockLedgerRecordEnqueueCommand,
  type IProductStockLedgerRecordPort,
  PRODUCT_STOCK_LEDGER_RECORD_PORT,
  PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS,
} from '../../outbound';
import { IProductStockLedgerRecordCommand } from '../interfaces';

@Injectable()
export class ProductStockLedgerService {
  constructor(
    @Inject(PRODUCT_STOCK_LEDGER_RECORD_PORT)
    private readonly queue: IProductStockLedgerRecordPort,
    @Inject(PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS)
    private readonly ledgerRetryAttempts: number,
    @InjectPinoLogger(ProductStockLedgerService.name)
    private readonly logger: PinoLogger,
  ) {}

  public async enqueue(command: IProductStockLedgerRecordCommand): Promise<void> {
    const { productId, productStockId, events } = command;
    const correlationId = CorrelationContextHelper.current(ProductStockLedgerService.name);
    const added = events.filter((event) => event instanceof ProductStockAddedEvent);

    for (const event of added) {
      const record = this.toRecord(productId, productStockId, event, correlationId);

      await this.enqueueWithRetry(record);
    }
  }

  private toRecord(
    productId: string,
    productStockId: string,
    event: ProductStockAddedEvent,
    correlationId: string,
  ): IProductStockLedgerRecordEnqueueCommand {
    const { sku, quantity } = event;
    const occurredAt = event.occurredAt.toISOString();

    return {
      operationKey: `product-restocked:${productStockId}`,
      subjectType: 'product',
      subjectId: productId,
      action: 'ProductRestocked',
      payload: { sku, quantity },
      occurredAt,
      correlationId,
    };
  }

  private async enqueueWithRetry(record: IProductStockLedgerRecordEnqueueCommand): Promise<void> {
    const { operationKey, subjectId, correlationId } = record;

    await ReplayRetryHelper.retryThenLogForReplay(() => this.enqueueOne(record), {
      maxAttempts: this.ledgerRetryAttempts,
      logger: this.logger,
      correlationId,
      label: 'Ledger enqueue (product stock)',
      context: { productId: subjectId, operationKey },
      replayMessage:
        'Ledger enqueue failed permanently: the record is absent from the queue and the ledger, replay this record',
    });
  }

  private async enqueueOne(record: IProductStockLedgerRecordEnqueueCommand): Promise<void> {
    const { operationKey, subjectId } = record;

    await this.queue.enqueue(record);

    this.logger.info({ productId: subjectId, operationKey }, 'Ledger record enqueued');
  }
}
