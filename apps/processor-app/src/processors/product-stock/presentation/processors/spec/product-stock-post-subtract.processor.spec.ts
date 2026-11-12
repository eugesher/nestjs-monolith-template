import type { Job } from 'bull';

import { CorrelationContextHelper } from '@acme-libs/observability';
import type { IProductStockPostSubtractPayload } from '@acme-core/contracts/product-stock';

import { ProductStockPostSubtractProcessor } from '../product-stock-post-subtract.processor';
import type {
  ProductStockPostSubtractReportFailureUseCase,
  ProductStockPostSubtractUseCase,
} from '../../../application';

describe('ProductStockPostSubtractProcessor', () => {
  let correlationIds: string[];
  let execute: jest.Mock;
  let report: jest.Mock;
  let processor: ProductStockPostSubtractProcessor;

  beforeEach(() => {
    correlationIds = [];
    execute = jest.fn().mockImplementation(() => {
      correlationIds.push(CorrelationContextHelper.current('ProductStockPostSubtractUseCase'));

      return Promise.resolve();
    });
    report = jest.fn().mockImplementation(() => {
      correlationIds.push(
        CorrelationContextHelper.current('ProductStockPostSubtractReportFailureUseCase'),
      );
    });
    processor = new ProductStockPostSubtractProcessor(
      { execute } as unknown as ProductStockPostSubtractUseCase,
      { execute: report } as unknown as ProductStockPostSubtractReportFailureUseCase,
    );
  });

  describe('handleRecord', () => {
    it('checks the products of the job under the correlation id of the subtraction', async () => {
      await processor.handleRecord({
        data: { productIds: ['100', '106'], correlationId: 'c0ffee00-0000-4000-8000-000000000001' },
      } as Job<IProductStockPostSubtractPayload>);

      expect(execute).toHaveBeenCalledWith({ productIds: ['100', '106'] });
      expect(correlationIds).toEqual(['c0ffee00-0000-4000-8000-000000000001']);
    });

    it('passes a failing check through, so Bull retries the job', async () => {
      execute.mockRejectedValue(new Error('deadlock'));

      const handling = processor.handleRecord({
        data: { productIds: ['100'], correlationId: 'c0ffee00-0000-4000-8000-000000000001' },
      } as Job<IProductStockPostSubtractPayload>);

      await expect(handling).rejects.toThrow('deadlock');
    });
  });

  describe('handleFailed', () => {
    it('reports the failed attempt inside the correlation context of the subtraction', async () => {
      await processor.handleFailed(
        {
          data: {
            productIds: ['100', '106'],
            correlationId: 'c0ffee00-0000-4000-8000-000000000001',
          },
          attemptsMade: 2,
          opts: { attempts: 3 },
        } as unknown as Job<IProductStockPostSubtractPayload>,
        new Error('deadlock'),
      );

      expect(report).toHaveBeenCalledWith({
        productIds: ['100', '106'],
        attempt: 2,
        attempts: 3,
        error: new Error('deadlock'),
      });
      expect(correlationIds).toEqual(['c0ffee00-0000-4000-8000-000000000001']);
    });

    it('treats a job without attempts as a single attempt', async () => {
      await processor.handleFailed(
        {
          data: { productIds: ['100'], correlationId: 'c0ffee00-0000-4000-8000-000000000001' },
          attemptsMade: 1,
          opts: {},
        } as unknown as Job<IProductStockPostSubtractPayload>,
        new Error('deadlock'),
      );

      expect(report).toHaveBeenCalledWith({
        productIds: ['100'],
        attempt: 1,
        attempts: 1,
        error: new Error('deadlock'),
      });
    });
  });
});
