import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import {
  PRODUCT_STOCK_CORE_PORT,
  PRODUCT_STOCK_POST_SUBTRACT_JOB_OPTIONS,
  PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
} from '@acme-core/contracts/product-stock';

import { ProductStockCoreLockUseCase, ProductStockCoreMoveUseCase } from '../application';
import {
  ProductStockCoreConfigQueueRetryAttemptsProvider,
  ProductStockCoreConfigRedisCommandTimeoutMsProvider,
  ProductStockCoreLockRepository,
  ProductStockCoreMoveRepository,
  ProductStockCorePostSubtractQueueAdapter,
} from '../infrastructure';
import { ProductStockCoreFacade } from './product-stock-core.facade';

@Module({
  imports: [
    BullModule.registerQueue({
      name: PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
      defaultJobOptions: PRODUCT_STOCK_POST_SUBTRACT_JOB_OPTIONS,
    }),
  ],
  exports: [PRODUCT_STOCK_CORE_PORT],
  providers: [
    { provide: PRODUCT_STOCK_CORE_PORT, useClass: ProductStockCoreFacade },
    ProductStockCoreLockUseCase,
    ProductStockCoreMoveUseCase,
    ProductStockCoreLockRepository.provider,
    ProductStockCoreMoveRepository.provider,
    ProductStockCorePostSubtractQueueAdapter.provider,
    ProductStockCoreConfigRedisCommandTimeoutMsProvider,
    ProductStockCoreConfigQueueRetryAttemptsProvider,
  ],
})
export class ProductStockCoreModule {}
