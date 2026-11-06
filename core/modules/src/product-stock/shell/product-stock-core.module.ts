import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { ConfigValueProvider } from '@acme-libs/config';
import {
  PRODUCT_STOCK_CORE_PORT,
  PRODUCT_STOCK_POST_SUBTRACT_JOB_OPTIONS,
  PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
} from '@acme-core/contracts/product-stock';

import { ProductStockCoreLockUseCase, ProductStockCoreMoveUseCase } from '../application';
import {
  ProductStockCoreLockRepository,
  ProductStockCoreMoveRepository,
  ProductStockCorePostSubtractQueueAdapter,
} from '../infrastructure';
import {
  PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT,
  PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT,
  PRODUCT_STOCK_CORE_POST_SUBTRACT_PORT,
  PRODUCT_STOCK_CORE_POST_SUBTRACT_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_STOCK_CORE_POST_SUBTRACT_TIMEOUT_MS_TOKEN,
} from '../outbound';
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
    {
      provide: PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT,
      useClass: ProductStockCoreLockRepository,
    },
    {
      provide: PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT,
      useClass: ProductStockCoreMoveRepository,
    },
    {
      provide: PRODUCT_STOCK_CORE_POST_SUBTRACT_PORT,
      useClass: ProductStockCorePostSubtractQueueAdapter,
    },
    ConfigValueProvider.provide({
      provide: PRODUCT_STOCK_CORE_POST_SUBTRACT_TIMEOUT_MS_TOKEN,
      property: 'REDIS_COMMAND_TIMEOUT_MS',
    }),
    ConfigValueProvider.provide({
      provide: PRODUCT_STOCK_CORE_POST_SUBTRACT_RETRY_ATTEMPTS_TOKEN,
      property: 'QUEUE_RETRY_ATTEMPTS',
    }),
  ],
})
export class ProductStockCoreModule {}
