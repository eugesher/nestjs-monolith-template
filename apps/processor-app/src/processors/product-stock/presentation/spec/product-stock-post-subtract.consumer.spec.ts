import { Job } from 'bull';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { IProductStockPostSubtractPayload } from '@acme-core/contracts/product-stock';

import { ProductStockPostSubtractUseCase } from '../../application';
import { ProductStockPostSubtractConsumer } from '../product-stock-post-subtract.consumer';

describe('ProductStockPostSubtractConsumer', () => {
  let correlationIds: string[];
  let execute: jest.Mock;
  let consumer: ProductStockPostSubtractConsumer;

  beforeEach(() => {
    correlationIds = [];
    execute = jest.fn().mockImplementation(() => {
      correlationIds.push(CorrelationContextHelper.current('ProductStockPostSubtractUseCase'));

      return Promise.resolve();
    });
    consumer = new ProductStockPostSubtractConsumer({
      execute,
    } as unknown as ProductStockPostSubtractUseCase);
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
