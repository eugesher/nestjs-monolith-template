import { DomainEventBase } from '@acme-libs/toolkit';
import type { ProductStatusEnum } from '@acme-libs/kernel';

import type { IProductLedgerRecordOutput } from '../interfaces';

export class ProductPublishedEvent extends DomainEventBase<string> {
  constructor(
    productId: string,
    public readonly sku: string,
    public readonly version: number,
    public readonly previousStatus: ProductStatusEnum,
  ) {
    super(productId);
  }

  public toLedgerRecord(): IProductLedgerRecordOutput {
    const { aggregateId, sku, version, previousStatus } = this;
    const occurredAt = this.occurredAt.toISOString();

    return {
      operationKey: `product-published:${aggregateId}:${version}`,
      subjectType: 'product',
      subjectId: aggregateId,
      action: 'ProductPublished',
      payload: { sku, previousStatus },
      occurredAt,
    };
  }
}
