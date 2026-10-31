import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { DomainEvent, Maybe, ReplayRetryHelper } from '@acme-libs/toolkit';
import { ProductCreatedEvent, ProductPublishedEvent, ProductRestockedEvent } from '../../domain';
import {
  type IProductLedgerRecordEnqueueCommand,
  type IProductLedgerRecordPort,
  PRODUCT_LEDGER_RECORD_PORT,
  PRODUCT_LEDGER_RETRY_ATTEMPTS,
} from '../../outbound';
import { IProductLedgerRecordCommand } from '../interfaces/commands/product-ledger-record.command';
import { IProductLedgerRestockRecordCommand } from '../interfaces/commands/product-ledger-restock-record.command';

@Injectable()
export class ProductLedgerService {
  constructor(
    @Inject(PRODUCT_LEDGER_RECORD_PORT)
    private readonly queue: IProductLedgerRecordPort,
    @Inject(PRODUCT_LEDGER_RETRY_ATTEMPTS)
    private readonly ledgerRetryAttempts: number,
    @InjectPinoLogger(ProductLedgerService.name)
    private readonly logger: PinoLogger,
  ) {}

  public async enqueue(command: IProductLedgerRecordCommand): Promise<void> {
    const { productId, events } = command;
    const correlationId = CorrelationContextHelper.current(ProductLedgerService.name);

    for (const event of events) {
      const record = this.toRecord(productId, event, correlationId);

      if (record !== undefined) {
        await this.enqueueWithRetry(record);
      }
    }
  }

  public async enqueueRestocked(command: IProductLedgerRestockRecordCommand): Promise<void> {
    const { productId, productStockId, events } = command;
    const correlationId = CorrelationContextHelper.current(ProductLedgerService.name);
    const restocked = events.filter((event) => event instanceof ProductRestockedEvent);

    for (const event of restocked) {
      const record = this.toRestockedRecord(productId, productStockId, event, correlationId);

      await this.enqueueWithRetry(record);
    }
  }

  private toRecord(
    productId: string,
    event: DomainEvent<Maybe<string>>,
    correlationId: string,
  ): Maybe<IProductLedgerRecordEnqueueCommand> {
    if (event instanceof ProductCreatedEvent) {
      const { sku, name } = event;
      const occurredAt = event.occurredAt.toISOString();

      return {
        operationKey: `product-created:${productId}`,
        subjectType: 'product',
        subjectId: productId,
        action: 'ProductCreated',
        payload: { sku, name },
        occurredAt,
        correlationId,
      };
    }

    if (event instanceof ProductPublishedEvent) {
      const { sku, version, previousStatus } = event;
      const occurredAt = event.occurredAt.toISOString();

      return {
        operationKey: `product-published:${productId}:${version}`,
        subjectType: 'product',
        subjectId: productId,
        action: 'ProductPublished',
        payload: { sku, previousStatus },
        occurredAt,
        correlationId,
      };
    }

    return undefined;
  }

  private toRestockedRecord(
    productId: string,
    productStockId: string,
    event: ProductRestockedEvent,
    correlationId: string,
  ): IProductLedgerRecordEnqueueCommand {
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

  private async enqueueWithRetry(record: IProductLedgerRecordEnqueueCommand): Promise<void> {
    const { operationKey, subjectId, correlationId } = record;

    await ReplayRetryHelper.retryThenLogForReplay(() => this.enqueueOne(record), {
      maxAttempts: this.ledgerRetryAttempts,
      logger: this.logger,
      correlationId,
      label: 'Ledger enqueue (product)',
      context: { productId: subjectId, operationKey },
      replayMessage:
        'Ledger enqueue failed permanently: the record is absent from the queue and the ledger, replay this record',
    });
  }

  private async enqueueOne(record: IProductLedgerRecordEnqueueCommand): Promise<void> {
    const { operationKey, subjectId } = record;

    await this.queue.enqueue(record);

    this.logger.info({ productId: subjectId, operationKey }, 'Ledger record enqueued');
  }
}
