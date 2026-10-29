import { Module } from '@nestjs/common';

import { IdempotencyCommonModule } from '@acme-staff-common/modules/idempotency';
import { LedgerCoreModule } from '@acme-core/modules/ledger';
import { ConfigProviderHelper } from '@acme-libs/config';
import { HttpExceptionFilter } from '@acme-libs/http';
import {
  ProductAccessService,
  ProductArchiveUseCase,
  ProductCreateUseCase,
  ProductGetManyUseCase,
  ProductGetOneUseCase,
  ProductLedgerService,
  ProductRenameUseCase,
  ProductWriteService,
} from './application';
import {
  ProductAccessRepository,
  ProductCreateRepository,
  ProductCrudRepository,
  ProductEventsAdapter,
  ProductIdempotencyCommonAdapter,
  ProductLedgerCoreAdapter,
  ProductTypeOrmModule,
  ProductWriteRepository,
} from './infrastructure';
import {
  PRODUCT_ACCESS_REPOSITORY_PORT,
  PRODUCT_CREATE_REPOSITORY_PORT,
  PRODUCT_CRUD_REPOSITORY_PORT,
  PRODUCT_EVENTS_PORT,
  PRODUCT_IDEMPOTENCY_PORT,
  PRODUCT_LEDGER_PORT,
  PRODUCT_OCC_RETRY_ATTEMPTS,
  PRODUCT_WRITE_REPOSITORY_PORT,
} from './outbound';
import { ProductController } from './presentation';

@Module({
  imports: [ProductTypeOrmModule.forFeature(), IdempotencyCommonModule, LedgerCoreModule],
  controllers: [ProductController],
  providers: [
    HttpExceptionFilter,
    ProductCreateUseCase,
    ProductGetManyUseCase,
    ProductGetOneUseCase,
    ProductRenameUseCase,
    ProductArchiveUseCase,
    ProductAccessService,
    ProductWriteService,
    ProductLedgerService,
    { provide: PRODUCT_ACCESS_REPOSITORY_PORT, useClass: ProductAccessRepository },
    { provide: PRODUCT_CREATE_REPOSITORY_PORT, useClass: ProductCreateRepository },
    { provide: PRODUCT_CRUD_REPOSITORY_PORT, useClass: ProductCrudRepository },
    { provide: PRODUCT_WRITE_REPOSITORY_PORT, useClass: ProductWriteRepository },
    { provide: PRODUCT_LEDGER_PORT, useClass: ProductLedgerCoreAdapter },
    { provide: PRODUCT_IDEMPOTENCY_PORT, useClass: ProductIdempotencyCommonAdapter },
    { provide: PRODUCT_EVENTS_PORT, useClass: ProductEventsAdapter },
    ConfigProviderHelper.value(PRODUCT_OCC_RETRY_ATTEMPTS, 'OCC_RETRY_ATTEMPTS'),
  ],
})
export class ProductModule {}
