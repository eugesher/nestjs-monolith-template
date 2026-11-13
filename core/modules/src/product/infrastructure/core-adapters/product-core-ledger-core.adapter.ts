import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { LEDGER_CORE_PORT, type ILedgerCorePort } from '@acme-core/contracts/ledger';

import {
  PRODUCT_CORE_LEDGER_PORT,
  type IProductCoreLedgerPort,
  type IProductCoreLedgerRecordArchivedCommand,
} from '../../outbound';

@Injectable()
export class ProductCoreLedgerCoreAdapter implements IProductCoreLedgerPort {
  public static readonly provider: ClassProvider<IProductCoreLedgerPort> = {
    provide: PRODUCT_CORE_LEDGER_PORT,
    useClass: ProductCoreLedgerCoreAdapter,
  };

  constructor(
    @Inject(LEDGER_CORE_PORT)
    private readonly ledger: ILedgerCorePort,
  ) {}

  public async recordArchived(command: IProductCoreLedgerRecordArchivedCommand): Promise<void> {
    const { productId, sku, version, previousStatus } = command;
    const occurredAt = new Date().toISOString();

    await this.ledger.handleEnqueue({
      operationKey: `product-archived:${productId}:${version}`,
      subjectType: 'product',
      subjectId: productId,
      action: 'ProductArchived',
      payload: { sku, previousStatus },
      occurredAt,
    });
  }
}
