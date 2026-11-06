import { Module } from '@nestjs/common';

import { ConfigProviderHelper } from '@acme-libs/config';
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
  ProductCreateRepository,
  ProductGetManyRepository,
  ProductIdempotencyCoreAdapter,
  ProductLedgerQueueAdapter,
  ProductReplaceTagsRepository,
  ProductStatusCoreAdapter,
  ProductTagCommonAdapter,
  ProductWriteRepository,
} from './infrastructure';
import {
  PRODUCT_ACCESS_REPOSITORY_PORT,
  PRODUCT_CATALOG_CACHE_PORT,
  PRODUCT_CREATE_REPOSITORY_PORT,
  PRODUCT_GET_MANY_REPOSITORY_PORT,
  PRODUCT_IDEMPOTENCY_PORT,
  PRODUCT_LEDGER_RECORD_PORT,
  PRODUCT_LEDGER_RECORD_TIMEOUT_MS,
  PRODUCT_LEDGER_RETRY_ATTEMPTS,
  PRODUCT_OCC_RETRY_ATTEMPTS,
  PRODUCT_REPLACE_TAGS_REPOSITORY_PORT,
  PRODUCT_STATUS_PORT,
  PRODUCT_TAG_PORT,
  PRODUCT_WRITE_REPOSITORY_PORT,
} from './outbound';
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
    { provide: PRODUCT_ACCESS_REPOSITORY_PORT, useClass: ProductAccessRepository },
    { provide: PRODUCT_CREATE_REPOSITORY_PORT, useClass: ProductCreateRepository },
    { provide: PRODUCT_GET_MANY_REPOSITORY_PORT, useClass: ProductGetManyRepository },
    { provide: PRODUCT_REPLACE_TAGS_REPOSITORY_PORT, useClass: ProductReplaceTagsRepository },
    { provide: PRODUCT_WRITE_REPOSITORY_PORT, useClass: ProductWriteRepository },
    { provide: PRODUCT_TAG_PORT, useClass: ProductTagCommonAdapter },
    { provide: PRODUCT_STATUS_PORT, useClass: ProductStatusCoreAdapter },
    { provide: PRODUCT_IDEMPOTENCY_PORT, useClass: ProductIdempotencyCoreAdapter },
    { provide: PRODUCT_LEDGER_RECORD_PORT, useClass: ProductLedgerQueueAdapter },
    { provide: PRODUCT_CATALOG_CACHE_PORT, useClass: ProductCatalogCacheAdapter },
    ConfigProviderHelper.value(PRODUCT_OCC_RETRY_ATTEMPTS, 'OCC_RETRY_ATTEMPTS'),
    ConfigProviderHelper.value(PRODUCT_LEDGER_RECORD_TIMEOUT_MS, 'REDIS_COMMAND_TIMEOUT_MS'),
    ConfigProviderHelper.value(PRODUCT_LEDGER_RETRY_ATTEMPTS, 'LEDGER_RETRY_ATTEMPTS'),
  ],
})
export class ProductModule {}
