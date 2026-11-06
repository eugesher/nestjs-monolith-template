import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { ProductCoreModule } from '@acme-core/modules/product';
import { TagCommonModule } from '@acme-staff/common/modules/tag';
import { LedgerRecordQueueModule } from '@acme-staff/common/shared/ledger-record';

import {
  ProductAccessService,
  ProductArchiveUseCase,
  ProductCreateUseCase,
  ProductGetManyUseCase,
  ProductGetOneUseCase,
  ProductGetTagsUseCase,
  ProductLedgerService,
  ProductPublishUseCase,
  ProductReplaceTagsUseCase,
  ProductUpdateUseCase,
  ProductWriteService,
} from './application';
import {
  ProductAccessRepository,
  ProductCatalogCacheAdapter,
  ProductConfigLedgerRetryAttemptsProvider,
  ProductConfigOccRetryAttemptsProvider,
  ProductConfigRedisCommandTimeoutMsProvider,
  ProductCreateRepository,
  ProductGetManyRepository,
  ProductIdempotencyCoreAdapter,
  ProductLedgerQueueAdapter,
  ProductReplaceTagsRepository,
  ProductStatusCoreAdapter,
  ProductTagCommonAdapter,
  ProductWriteRepository,
} from './infrastructure';
import { ProductController } from './presentation';

@Module({
  imports: [LedgerRecordQueueModule, TagCommonModule, IdempotencyCoreModule, ProductCoreModule],
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
    ProductLedgerService,
    ProductAccessRepository.provider,
    ProductCreateRepository.provider,
    ProductGetManyRepository.provider,
    ProductReplaceTagsRepository.provider,
    ProductWriteRepository.provider,
    ProductTagCommonAdapter.provider,
    ProductStatusCoreAdapter.provider,
    ProductIdempotencyCoreAdapter.provider,
    ProductLedgerQueueAdapter.provider,
    ProductCatalogCacheAdapter.provider,
    ProductConfigOccRetryAttemptsProvider,
    ProductConfigRedisCommandTimeoutMsProvider,
    ProductConfigLedgerRetryAttemptsProvider,
  ],
})
export class ProductModule {}
