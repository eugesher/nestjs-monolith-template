import { Module } from '@nestjs/common';

import { ConfigValueProvider } from '@acme-libs/config';
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
  PRODUCT_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  PRODUCT_LEDGER_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN,
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
    ConfigValueProvider.provide({
      provide: PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN,
      property: 'OCC_RETRY_ATTEMPTS',
    }),
    ConfigValueProvider.provide({
      provide: PRODUCT_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      property: 'REDIS_COMMAND_TIMEOUT_MS',
    }),
    ConfigValueProvider.provide({
      provide: PRODUCT_LEDGER_RETRY_ATTEMPTS_TOKEN,
      property: 'LEDGER_RETRY_ATTEMPTS',
    }),
  ],
})
export class ProductModule {}
