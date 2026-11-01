import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs-observability';
import { ISubjectLedgerRecord, SubjectLedgerService } from '@acme-libs-ledger';

import { ProductStockAddedEvent } from '../../domain';
import {
  type IProductStockLedgerRecordPort,
  PRODUCT_STOCK_LEDGER_RECORD_PORT,
  PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS,
} from '../../outbound';
import { IProductStockLedgerRecordCommand } from '../interfaces';

@Injectable()
export class ProductStockLedgerService extends SubjectLedgerService {
  constructor(
    @Inject(PRODUCT_STOCK_LEDGER_RECORD_PORT)
    protected readonly queue: IProductStockLedgerRecordPort,
    @Inject(PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS)
    protected readonly retryAttempts: number,
    @InjectPinoLogger(ProductStockLedgerService.name)
    protected readonly logger: PinoLogger,
  ) {
    super();
  }

  public async recordEvents(command: IProductStockLedgerRecordCommand): Promise<void> {
    const { productId, productStockId, events } = command;
    const correlationId = CorrelationContextHelper.current(ProductStockLedgerService.name);
    const added = events.filter((event) => event instanceof ProductStockAddedEvent);

    for (const event of added) {
      const record = this.toRecord(productId, productStockId, event, correlationId);

      await this.record(record);
    }
  }

  private toRecord(
    productId: string,
    productStockId: string,
    event: ProductStockAddedEvent,
    correlationId: string,
  ): ISubjectLedgerRecord {
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
}
