import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import {
  LedgerQueueModule,
  ProductStockPostSubtractQueueModule,
} from '@acme-processor/common/shared';

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
  imports: [LedgerQueueModule, ProductStockPostSubtractQueueModule],
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
