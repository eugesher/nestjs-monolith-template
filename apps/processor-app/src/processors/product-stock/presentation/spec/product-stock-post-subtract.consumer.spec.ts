import type { Job } from 'bull';

import { IProductStockPostSubtractPayload } from '@acme-core/contracts/product-stock';
import { CorrelationContextHelper } from '@acme-libs/observability';
import { ProductStockArchiveOutOfStockUseCase } from '../../application';
import { ProductStockPostSubtractConsumer } from '../product-stock-post-subtract.consumer';

describe('ProductStockPostSubtractConsumer', () => {
  let correlationIds: string[];
  let execute: jest.Mock;
  let consumer: ProductStockPostSubtractConsumer;

  beforeEach(() => {
    correlationIds = [];
    execute = jest.fn().mockImplementation(() => {
      correlationIds.push(CorrelationContextHelper.current('ProductStockArchiveOutOfStockUseCase'));

      return Promise.resolve();
    });
    consumer = new ProductStockPostSubtractConsumer({
      execute,
    } as unknown as ProductStockArchiveOutOfStockUseCase);
  });

  describe('handleRecord', () => {
    it('checks the products of the job under the correlation id of the subtraction', async () => {
      await consumer.handleRecord({
        data: { productIds: ['100', '106'], correlationId: 'corr-1' },
      } as Job<IProductStockPostSubtractPayload>);

      expect(execute).toHaveBeenCalledWith({ productIds: ['100', '106'] });
      expect(correlationIds).toEqual(['corr-1']);
    });
  });
});
