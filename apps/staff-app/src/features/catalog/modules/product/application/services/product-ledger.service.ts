import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { ISubjectLedgerRecord, SubjectLedgerService } from '@acme-libs/ledger';
import { DomainEvent, Maybe } from '@acme-libs/toolkit';

import { ProductCreatedEvent, ProductPublishedEvent } from '../../domain';
import {
  type IProductLedgerRecordPort,
  PRODUCT_LEDGER_RECORD_PORT,
  PRODUCT_LEDGER_RETRY_ATTEMPTS,
} from '../../outbound';
import { IProductLedgerRecordCommand } from '../interfaces';

@Injectable()
export class ProductLedgerService extends SubjectLedgerService {
  constructor(
    @Inject(PRODUCT_LEDGER_RECORD_PORT)
    protected readonly queue: IProductLedgerRecordPort,
    @Inject(PRODUCT_LEDGER_RETRY_ATTEMPTS)
    protected readonly retryAttempts: number,
    @InjectPinoLogger(ProductLedgerService.name)
    protected readonly logger: PinoLogger,
  ) {
    super();
  }

  public async recordEvents(command: IProductLedgerRecordCommand): Promise<void> {
    const { productId, events } = command;
    const correlationId = CorrelationContextHelper.current(ProductLedgerService.name);

    for (const event of events) {
      const record = this.toRecord(productId, event, correlationId);

      if (record !== undefined) {
        await this.record(record);
      }
    }
  }

  private toRecord(
    productId: string,
    event: DomainEvent<Maybe<string>>,
    correlationId: string,
  ): Maybe<ISubjectLedgerRecord> {
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
}
