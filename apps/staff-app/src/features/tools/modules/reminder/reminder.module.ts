import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import {
  ReminderAccessService,
  ReminderCompleteUseCase,
  ReminderCreateUseCase,
  ReminderDeleteUseCase,
  ReminderGetManyUseCase,
  ReminderGetSummaryUseCase,
  ReminderRescheduleUseCase,
  ReminderWriteService,
} from './application';
import {
  ReminderAccessRepository,
  ReminderConfigCacheTtlMsDefaultProvider,
  ReminderConfigOccRetryAttemptsProvider,
  ReminderCreateRepository,
  ReminderDeleteRepository,
  ReminderGetManyRepository,
  ReminderGetSummaryRepository,
  ReminderSummaryCacheAdapter,
  ReminderWriteRepository,
} from './infrastructure';
import { ReminderController } from './presentation';

@Module({
  controllers: [ReminderController],
  providers: [
    HttpExceptionFilter,
    ReminderCreateUseCase,
    ReminderGetManyUseCase,
    ReminderGetSummaryUseCase,
    ReminderCompleteUseCase,
    ReminderRescheduleUseCase,
    ReminderDeleteUseCase,
    ReminderAccessService,
    ReminderWriteService,
    ReminderAccessRepository.provider,
    ReminderCreateRepository.provider,
    ReminderDeleteRepository.provider,
    ReminderGetManyRepository.provider,
    ReminderGetSummaryRepository.provider,
    ReminderWriteRepository.provider,
    ReminderSummaryCacheAdapter.provider,
    ReminderConfigOccRetryAttemptsProvider,
    ReminderConfigCacheTtlMsDefaultProvider,
  ],
})
export class ReminderModule {}
