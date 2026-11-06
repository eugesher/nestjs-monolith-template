import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { LedgerRecordQueueModule } from '@acme-processor/common/shared/ledger-record';
import { ProductStockPostSubtractQueueModule } from '@acme-processor/common/shared/product-stock-post-subtract';

import {
  QueueDeleteFailedJobUseCase,
  QueueFailedJobService,
  QueueListFailedJobsUseCase,
  QueueListUseCase,
  QueueRetryFailedJobUseCase,
} from './application';
import { QueueRegistryQueueAdapter } from './infrastructure';
import { QueueController } from './presentation';

@Module({
  imports: [LedgerRecordQueueModule, ProductStockPostSubtractQueueModule],
  controllers: [QueueController],
  providers: [
    HttpExceptionFilter,
    QueueListUseCase,
    QueueListFailedJobsUseCase,
    QueueRetryFailedJobUseCase,
    QueueDeleteFailedJobUseCase,
    QueueFailedJobService,
    QueueRegistryQueueAdapter.provider,
  ],
})
export class QueueModule {}
