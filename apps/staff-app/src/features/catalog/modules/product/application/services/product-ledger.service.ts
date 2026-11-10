import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { SubjectLedgerService } from '@acme-libs/ledger';
import { CorrelationContextHelper } from '@acme-libs/observability';

import { ProductPublishedEvent } from '../../domain';
import {
  PRODUCT_LEDGER_RECORD_PORT,
  PRODUCT_LEDGER_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  type IProductLedgerRecordPort,
} from '../../outbound';
import {
  IProductLedgerRecordCreatedCommand,
  IProductLedgerRecordEventsCommand,
} from '../interfaces';

@Injectable()
export class ProductLedgerService extends SubjectLedgerService {
  constructor(
    @Inject(PRODUCT_LEDGER_RECORD_PORT)
    protected readonly queue: IProductLedgerRecordPort,
    @Inject(PRODUCT_LEDGER_RETRY_ATTEMPTS_TOKEN)
    protected readonly retryAttempts: number,
    @Inject(PRODUCT_REDIS_COMMAND_TIMEOUT_MS_TOKEN)
    protected readonly timeoutMs: number,
    @InjectPinoLogger(ProductLedgerService.name)
    protected readonly logger: PinoLogger,
  ) {
    super();
  }

  public async recordCreated(command: IProductLedgerRecordCreatedCommand): Promise<void> {
    const { productId, sku, name } = command;
    const occurredAt = new Date().toISOString();
    const correlationId = CorrelationContextHelper.current(ProductLedgerService.name);

    await this.record({
      operationKey: `product-created:${productId}`,
      subjectType: 'product',
      subjectId: productId,
      action: 'ProductCreated',
      payload: { sku, name },
      occurredAt,
      correlationId,
    });
  }

  public async recordEvents(command: IProductLedgerRecordEventsCommand): Promise<void> {
    const { events } = command;
    const correlationId = CorrelationContextHelper.current(ProductLedgerService.name);
    const published = events.filter((event) => event instanceof ProductPublishedEvent);

    for (const event of published) {
      const record = event.toLedgerRecord(correlationId);

      await this.record(record);
    }
  }
}
