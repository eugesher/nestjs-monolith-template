import type { Job } from 'bull';

import { CorrelationContextHelper } from '@acme-libs/observability';
import type { IProductStockPostSubtractPayload } from '@acme-core/contracts/product-stock';

import { ProductStockPostSubtractProcessor } from '../product-stock-post-subtract.processor';
import type { ProductStockPostSubtractUseCase } from '../../../application';

describe('ProductStockPostSubtractProcessor', () => {
  let correlationIds: string[];
  let execute: jest.Mock;
  let processor: ProductStockPostSubtractProcessor;

  beforeEach(() => {
    correlationIds = [];
    execute = jest.fn().mockImplementation(() => {
      correlationIds.push(CorrelationContextHelper.current('ProductStockPostSubtractUseCase'));

      return Promise.resolve();
    });
    processor = new ProductStockPostSubtractProcessor({
      execute,
    } as unknown as ProductStockPostSubtractUseCase);
  });

  describe('handleRecord', () => {
    it('checks the products of the job under the correlation id of the subtraction', async () => {
      await processor.handleRecord({
        data: { productIds: ['100', '106'], correlationId: 'corr-1' },
      } as Job<IProductStockPostSubtractPayload>);

      expect(execute).toHaveBeenCalledWith({ productIds: ['100', '106'] });
      expect(correlationIds).toEqual(['corr-1']);
    });
  });
});
