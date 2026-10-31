import { Module } from '@nestjs/common';

import { ProductCoreModule } from '@acme-core/modules/product';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';
import { ProductStockArchiveOutOfStockUseCase } from './application';
import {
  ProductStockArchiveCoreAdapter,
  ProductStockArchiveOutOfStockRepository,
  ProductStockOnHandCoreAdapter,
  ProductStockTypeOrmModule,
} from './infrastructure';
import {
  PRODUCT_STOCK_ARCHIVE_PORT,
  PRODUCT_STOCK_ARCHIVE_OUT_OF_STOCK_REPOSITORY_PORT,
  PRODUCT_STOCK_ON_HAND_PORT,
} from './outbound';
import { ProductStockPostSubtractConsumer } from './presentation/product-stock-post-subtract.consumer';

@Module({
  imports: [ProductStockTypeOrmModule.forFeature(), ProductCoreModule, ProductStockCoreModule],
  providers: [
    ProductStockPostSubtractConsumer,
    ProductStockArchiveOutOfStockUseCase,
    {
      provide: PRODUCT_STOCK_ARCHIVE_OUT_OF_STOCK_REPOSITORY_PORT,
      useClass: ProductStockArchiveOutOfStockRepository,
    },
    { provide: PRODUCT_STOCK_ON_HAND_PORT, useClass: ProductStockOnHandCoreAdapter },
    { provide: PRODUCT_STOCK_ARCHIVE_PORT, useClass: ProductStockArchiveCoreAdapter },
  ],
})
export class ProductStockModule {}
