import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { SubjectLedgerService } from '@acme-libs/ledger';
import { CorrelationContextHelper } from '@acme-libs/observability';

import { ProductStockAddedEvent } from '../../domain';
import {
  PRODUCT_STOCK_LEDGER_RECORD_PORT,
  PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS_TOKEN,
  type IProductStockLedgerRecordPort,
} from '../../outbound';
import { IProductStockLedgerRecordEventsCommand } from '../interfaces';

@Injectable()
export class ProductStockLedgerService extends SubjectLedgerService {
  constructor(
    @Inject(PRODUCT_STOCK_LEDGER_RECORD_PORT)
    protected readonly queue: IProductStockLedgerRecordPort,
    @Inject(PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS_TOKEN)
    protected readonly retryAttempts: number,
    @InjectPinoLogger(ProductStockLedgerService.name)
    protected readonly logger: PinoLogger,
  ) {
    super();
  }

  public async recordEvents(command: IProductStockLedgerRecordEventsCommand): Promise<void> {
    const { productStockId, events } = command;
    const correlationId = CorrelationContextHelper.current(ProductStockLedgerService.name);
    const added = events.filter((event) => event instanceof ProductStockAddedEvent);

    for (const event of added) {
      const record = event.toLedgerRecord(productStockId, correlationId);

      await this.record(record);
    }
  }
}
