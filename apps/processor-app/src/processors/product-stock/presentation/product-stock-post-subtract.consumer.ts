import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

import { CorrelationContextHelper } from '@acme-libs/observability';
import {
  IProductStockPostSubtractPayload,
  PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
} from '@acme-core/contracts/product-stock';

import { ProductStockPostSubtractUseCase } from '../application';

@Processor(PRODUCT_STOCK_POST_SUBTRACT_QUEUE)
export class ProductStockPostSubtractConsumer {
  constructor(private readonly postSubtract: ProductStockPostSubtractUseCase) {}

  @Process()
  public async handleRecord(job: Job<IProductStockPostSubtractPayload>): Promise<void> {
    const { data } = job;
    const { productIds, correlationId } = data;

    await CorrelationContextHelper.run(correlationId, () =>
      this.postSubtract.execute({ productIds }),
    );
  }
}
