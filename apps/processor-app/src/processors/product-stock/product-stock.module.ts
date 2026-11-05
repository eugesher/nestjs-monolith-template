import { Module } from '@nestjs/common';

import { ProductCoreModule } from '@acme-core/modules/product';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';

import { ProductStockPostSubtractUseCase } from './application';
import {
  ProductStockArchiveCoreAdapter,
  ProductStockPostSubtractRepository,
  ProductStockOnHandCoreAdapter,
} from './infrastructure';
import {
  PRODUCT_STOCK_ARCHIVE_PORT,
  PRODUCT_STOCK_POST_SUBTRACT_REPOSITORY_PORT,
  PRODUCT_STOCK_ON_HAND_PORT,
} from './outbound';
import { ProductStockPostSubtractConsumer } from './presentation/product-stock-post-subtract.consumer';

@Module({
  imports: [ProductCoreModule, ProductStockCoreModule],
  providers: [
    ProductStockPostSubtractConsumer,
    ProductStockPostSubtractUseCase,
    {
      provide: PRODUCT_STOCK_POST_SUBTRACT_REPOSITORY_PORT,
      useClass: ProductStockPostSubtractRepository,
    },
    { provide: PRODUCT_STOCK_ON_HAND_PORT, useClass: ProductStockOnHandCoreAdapter },
    { provide: PRODUCT_STOCK_ARCHIVE_PORT, useClass: ProductStockArchiveCoreAdapter },
  ],
})
export class ProductStockModule {}
