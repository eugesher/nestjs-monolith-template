import { Module } from '@nestjs/common';

import { BullSetupModule } from '@acme-libs/queue';
import {
  PRODUCT_STOCK_CORE_PORT,
  PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
} from '@acme-core/contracts/product-stock';

import { ProductStockCoreLockUseCase, ProductStockCoreMoveUseCase } from '../application';
import {
  ProductStockCoreConfigQueueRetryAttemptsProvider,
  ProductStockCoreConfigRedisCommandTimeoutMsProvider,
  ProductStockCoreLockRepository,
  ProductStockCoreMoveRepository,
  ProductStockCorePostSubtractQueueAdapter,
  ProductStockCoreTransactionAdapter,
} from '../infrastructure';
import { ProductStockCoreFacade } from './product-stock-core.facade';

@Module({
  imports: [BullSetupModule.registerQueue(PRODUCT_STOCK_POST_SUBTRACT_QUEUE)],
  exports: [PRODUCT_STOCK_CORE_PORT],
  providers: [
    { provide: PRODUCT_STOCK_CORE_PORT, useClass: ProductStockCoreFacade },
    ProductStockCoreLockUseCase,
    ProductStockCoreMoveUseCase,
    ProductStockCoreLockRepository.provider,
    ProductStockCoreMoveRepository.provider,
    ProductStockCorePostSubtractQueueAdapter.provider,
    ProductStockCoreTransactionAdapter.provider,
    ProductStockCoreConfigRedisCommandTimeoutMsProvider,
    ProductStockCoreConfigQueueRetryAttemptsProvider,
  ],
})
export class ProductStockCoreModule {}
