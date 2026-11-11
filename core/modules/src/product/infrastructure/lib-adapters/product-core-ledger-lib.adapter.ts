import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { LEDGER_LIB_PORT, type ILedgerLibPort } from '@acme-libs/contracts/ledger';

import {
  PRODUCT_CORE_LEDGER_PORT,
  type IProductCoreLedgerPort,
  type IProductCoreLedgerRecordArchivedCommand,
} from '../../outbound';

@Injectable()
export class ProductCoreLedgerLibAdapter implements IProductCoreLedgerPort {
  public static readonly provider: ClassProvider<IProductCoreLedgerPort> = {
    provide: PRODUCT_CORE_LEDGER_PORT,
    useClass: ProductCoreLedgerLibAdapter,
  };

  constructor(
    @Inject(LEDGER_LIB_PORT)
    private readonly ledger: ILedgerLibPort,
  ) {}

  public async recordArchived(command: IProductCoreLedgerRecordArchivedCommand): Promise<void> {
    const { productId, sku, version, previousStatus } = command;
    const occurredAt = new Date().toISOString();
    const correlationId = CorrelationContextHelper.current(ProductCoreLedgerLibAdapter.name);

    await this.ledger.handleEnqueue({
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
