import { Module } from '@nestjs/common';

import { ConfigValueProvider } from '@acme-libs/config';
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
  ReminderCreateRepository,
  ReminderDeleteRepository,
  ReminderGetManyRepository,
  ReminderGetSummaryRepository,
  ReminderSummaryCacheAdapter,
  ReminderWriteRepository,
} from './infrastructure';
import { REMINDER_OCC_RETRY_ATTEMPTS_TOKEN, REMINDER_CACHE_TTL_MS_DEFAULT_TOKEN } from './outbound';
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
    ConfigValueProvider.provide({
      provide: REMINDER_OCC_RETRY_ATTEMPTS_TOKEN,
      property: 'OCC_RETRY_ATTEMPTS',
    }),
    ConfigValueProvider.provide({
      provide: REMINDER_CACHE_TTL_MS_DEFAULT_TOKEN,
      property: 'CACHE_TTL_MS_DEFAULT',
    }),
  ],
})
export class ReminderModule {}
