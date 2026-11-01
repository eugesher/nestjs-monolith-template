import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs-observability';
import { SubjectLedgerService } from '@acme-libs-ledger';

import {
  type IProductCoreLedgerRecordPort,
  PRODUCT_CORE_LEDGER_RECORD_PORT,
  PRODUCT_CORE_LEDGER_RETRY_ATTEMPTS,
} from '../../outbound';
import { IProductCoreLedgerRecordArchivedCommand } from '../interfaces';

@Injectable()
export class ProductCoreLedgerService extends SubjectLedgerService {
  constructor(
    @Inject(PRODUCT_CORE_LEDGER_RECORD_PORT)
    protected readonly queue: IProductCoreLedgerRecordPort,
    @Inject(PRODUCT_CORE_LEDGER_RETRY_ATTEMPTS)
    protected readonly retryAttempts: number,
    @InjectPinoLogger(ProductCoreLedgerService.name)
    protected readonly logger: PinoLogger,
  ) {
    super();
  }

  public async recordArchived(command: IProductCoreLedgerRecordArchivedCommand): Promise<void> {
    const { productId, sku, version, previousStatus } = command;
    const occurredAt = new Date().toISOString();
    const correlationId = CorrelationContextHelper.current(ProductCoreLedgerService.name);

    await this.record({
      operationKey: `product-archived:${productId}:${version}`,
      subjectType: 'product',
      subjectId: productId,
      action: 'ProductArchived',
      payload: { sku, previousStatus },
      occurredAt,
      correlationId,
    });
  }
}
