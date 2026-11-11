import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { LedgerLibModule } from '@acme-libs/ledger';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { ProductCoreModule } from '@acme-core/modules/product';
import { TagCommonModule } from '@acme-staff/common/modules';

import {
  ProductAccessService,
  ProductArchiveUseCase,
  ProductCreateUseCase,
  ProductGetManyUseCase,
  ProductGetOneUseCase,
  ProductGetTagsUseCase,
  ProductPublishUseCase,
  ProductReplaceTagsUseCase,
  ProductUpdateUseCase,
  ProductWriteService,
} from './application';
import {
  ProductAccessRepository,
  ProductCatalogCacheAdapter,
  ProductConfigOccRetryAttemptsProvider,
  ProductCreateRepository,
  ProductGetManyRepository,
  ProductIdempotencyCoreAdapter,
  ProductLedgerLibAdapter,
  ProductReplaceTagsRepository,
  ProductStatusCoreAdapter,
  ProductTagCommonAdapter,
  ProductTransactionAdapter,
  ProductWriteRepository,
} from './infrastructure';
import { ProductController } from './presentation';

@Module({
  imports: [LedgerLibModule, TagCommonModule, IdempotencyCoreModule, ProductCoreModule],
  controllers: [ProductController],
  providers: [
    HttpExceptionFilter,
    ProductCreateUseCase,
    ProductGetManyUseCase,
    ProductGetOneUseCase,
    ProductUpdateUseCase,
    ProductPublishUseCase,
    ProductArchiveUseCase,
    ProductGetTagsUseCase,
    ProductReplaceTagsUseCase,
    ProductAccessService,
    ProductWriteService,
    ProductAccessRepository.provider,
    ProductCreateRepository.provider,
    ProductGetManyRepository.provider,
    ProductReplaceTagsRepository.provider,
    ProductWriteRepository.provider,
    ProductTagCommonAdapter.provider,
    ProductStatusCoreAdapter.provider,
    ProductIdempotencyCoreAdapter.provider,
    ProductCatalogCacheAdapter.provider,
    ProductLedgerLibAdapter.provider,
    ProductTransactionAdapter.provider,
    ProductConfigOccRetryAttemptsProvider,
  ],
})
export class ProductModule {}
