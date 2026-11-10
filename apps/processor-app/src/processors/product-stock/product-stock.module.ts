import { Module } from '@nestjs/common';

import { ProductCoreModule } from '@acme-core/modules/product';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';

import { ProductStockPostSubtractUseCase } from './application';
import {
  ProductStockArchiveCoreAdapter,
  ProductStockOnHandCoreAdapter,
  ProductStockPostSubtractRepository,
  ProductStockTransactionAdapter,
} from './infrastructure';
import { ProductStockPostSubtractProcessor } from './presentation';

@Module({
  imports: [ProductCoreModule, ProductStockCoreModule],
  providers: [
    ProductStockPostSubtractProcessor,
    ProductStockPostSubtractUseCase,
    ProductStockPostSubtractRepository.provider,
    ProductStockOnHandCoreAdapter.provider,
    ProductStockArchiveCoreAdapter.provider,
    ProductStockTransactionAdapter.provider,
  ],
})
export class ProductStockModule {}
