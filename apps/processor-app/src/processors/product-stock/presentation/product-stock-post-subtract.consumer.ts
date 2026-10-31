import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

import {
  type IProductStockPostSubtractPayload,
  PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
} from '@acme-core/contracts/product-stock';
import { CorrelationContextHelper } from '@acme-libs/observability';
import { ProductStockArchiveOutOfStockUseCase } from '../application';

@Processor(PRODUCT_STOCK_POST_SUBTRACT_QUEUE)
export class ProductStockPostSubtractConsumer {
  constructor(private readonly archiveOutOfStock: ProductStockArchiveOutOfStockUseCase) {}

  @Process()
  public async handleRecord(job: Job<IProductStockPostSubtractPayload>): Promise<void> {
    const { data } = job;
    const { productIds, correlationId } = data;

    await CorrelationContextHelper.run(correlationId, () =>
      this.archiveOutOfStock.execute({ productIds }),
    );
  }
}
