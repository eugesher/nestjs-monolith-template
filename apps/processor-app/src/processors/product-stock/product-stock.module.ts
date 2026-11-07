import { Module } from '@nestjs/common';

import { ProductCoreModule } from '@acme-core/modules/product';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';

import { ProductStockPostSubtractUseCase } from './application';
import {
  ProductStockArchiveCoreAdapter,
  ProductStockOnHandCoreAdapter,
  ProductStockPostSubtractRepository,
} from './infrastructure';
import { ProductStockPostSubtractProcessor } from './presentation/product-stock-post-subtract.processor';

@Module({
  imports: [ProductCoreModule, ProductStockCoreModule],
  providers: [
    ProductStockPostSubtractProcessor,
    ProductStockPostSubtractUseCase,
    ProductStockPostSubtractRepository.provider,
    ProductStockOnHandCoreAdapter.provider,
    ProductStockArchiveCoreAdapter.provider,
  ],
})
export class ProductStockModule {}
