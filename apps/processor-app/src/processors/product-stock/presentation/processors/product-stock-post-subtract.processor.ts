import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

import { CorrelationContextHelper } from '@acme-libs/observability';
import {
  PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
  type IProductStockPostSubtractPayload,
} from '@acme-core/contracts/product-stock';

import {
  ProductStockPostSubtractReportFailureUseCase,
  ProductStockPostSubtractUseCase,
} from '../../application';

@Processor(PRODUCT_STOCK_POST_SUBTRACT_QUEUE)
export class ProductStockPostSubtractProcessor {
  constructor(
    private readonly postSubtract: ProductStockPostSubtractUseCase,
    private readonly reportFailure: ProductStockPostSubtractReportFailureUseCase,
  ) {}

  @Process()
  public async handleRecord(job: Job<IProductStockPostSubtractPayload>): Promise<void> {
    const { data } = job;
    const { productIds, correlationId } = data;

    await CorrelationContextHelper.run(correlationId, () =>
      this.postSubtract.execute({ productIds }),
    );
  }

  @OnQueueFailed()
  public async handleFailed(
    job: Job<IProductStockPostSubtractPayload>,
    error: Error,
  ): Promise<void> {
    const { data, attemptsMade, opts } = job;
    const { productIds, correlationId } = data;
    const attempts = opts.attempts ?? 1;

    await CorrelationContextHelper.run(correlationId, () => {
      this.reportFailure.execute({ productIds, attempt: attemptsMade, attempts, error });

      return Promise.resolve();
    });
  }
}
