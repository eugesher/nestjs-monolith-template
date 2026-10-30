import { Module } from '@nestjs/common';

import { PRODUCT_STOCK_CORE_PORT } from '@acme-core/contracts/product-stock';
import { ProductStockCoreLockUseCase, ProductStockCoreMoveUseCase } from '../application';
import {
  ProductStockCoreLockRepository,
  ProductStockCoreMoveRepository,
  ProductStockCoreTypeOrmModule,
} from '../infrastructure';
import {
  PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT,
  PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT,
} from '../outbound';
import { ProductStockCoreFacade } from './product-stock-core.facade';

@Module({
  imports: [ProductStockCoreTypeOrmModule.forFeature()],
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
  ],
})
export class ProductStockCoreModule {}
