import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { DomainEvent, Maybe, ReplayRetryHelper } from '@acme-libs/toolkit';
import { ProductArchivedEvent, ProductCreatedEvent } from '../../domain';
import {
  type IProductLedgerAppendCommand,
  type IProductLedgerPort,
  type IProductLedgerRecordEnqueueCommand,
  type IProductLedgerRecordPort,
  PRODUCT_LEDGER_PORT,
  PRODUCT_LEDGER_RECORD_PORT,
} from '../../outbound';
import { IProductLedgerRecordCommand } from '../interfaces/commands/product-ledger-record.command';

@Injectable()
export class ProductLedgerService {
  private static readonly LEDGER_ATTEMPTS = 3;

  constructor(
    @Inject(PRODUCT_LEDGER_RECORD_PORT)
    private readonly queue: IProductLedgerRecordPort,
    @Inject(PRODUCT_LEDGER_PORT)
    private readonly ledger: IProductLedgerPort,
    @InjectPinoLogger(ProductLedgerService.name)
    private readonly logger: PinoLogger,
  ) {}

  public async enqueue(command: IProductLedgerRecordCommand): Promise<void> {
    const { productId, events } = command;
    const correlationId = CorrelationContextHelper.current(ProductLedgerService.name);

    for (const event of events) {
      const record = this.toRecord(productId, event);

      if (record !== undefined) {
        await this.enqueueWithRetry({ ...record, correlationId });
      }
    }
  }

  public async recordArchived(command: IProductLedgerRecordCommand): Promise<void> {
    const { productId, events } = command;
    const archived = events.filter((event) => event instanceof ProductArchivedEvent);

    for (const event of archived) {
      await this.appendArchived(productId, event);
    }
  }

  private toRecord(
    productId: string,
    event: DomainEvent<Maybe<string>>,
  ): Maybe<IProductLedgerAppendCommand> {
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
      };
    }

    if (event instanceof ProductArchivedEvent) {
      return this.toArchivedRecord(productId, event);
    }

    return undefined;
  }

  private toArchivedRecord(
    productId: string,
    event: ProductArchivedEvent,
  ): IProductLedgerAppendCommand {
    const { sku, previousStatus } = event;
    const occurredAt = event.occurredAt.toISOString();

    return {
      operationKey: `product-archived:${productId}`,
      subjectType: 'product',
      subjectId: productId,
      action: 'ProductArchived',
      payload: { sku, previousStatus },
      occurredAt,
    };
  }

  private enqueueWithRetry(record: IProductLedgerRecordEnqueueCommand): Promise<void> {
    const { operationKey, subjectId, correlationId } = record;

    return ReplayRetryHelper.retryThenLogForReplay(() => this.enqueueOne(record), {
      maxAttempts: ProductLedgerService.LEDGER_ATTEMPTS,
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

  private appendArchived(productId: string, event: ProductArchivedEvent): Promise<void> {
    const record = this.toArchivedRecord(productId, event);
    const { operationKey } = record;
    const correlationId = CorrelationContextHelper.current(ProductLedgerService.name);

    return ReplayRetryHelper.retryThenLogForReplay(() => this.ledger.append(record), {
      maxAttempts: ProductLedgerService.LEDGER_ATTEMPTS,
      logger: this.logger,
      correlationId,
      label: 'Ledger append (product archived)',
      context: { productId, operationKey },
      replayMessage:
        'Ledger append failed permanently: the product is archived but absent from the ledger, replay this record',
    });
  }
}
