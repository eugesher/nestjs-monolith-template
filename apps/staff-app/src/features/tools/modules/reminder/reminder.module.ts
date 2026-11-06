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
import {
  REMINDER_ACCESS_REPOSITORY_PORT,
  REMINDER_CREATE_REPOSITORY_PORT,
  REMINDER_DELETE_REPOSITORY_PORT,
  REMINDER_GET_MANY_REPOSITORY_PORT,
  REMINDER_GET_SUMMARY_REPOSITORY_PORT,
  REMINDER_OCC_RETRY_ATTEMPTS,
  REMINDER_SUMMARY_PORT,
  REMINDER_SUMMARY_TTL_MS,
  REMINDER_WRITE_REPOSITORY_PORT,
} from './outbound';
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
    { provide: REMINDER_ACCESS_REPOSITORY_PORT, useClass: ReminderAccessRepository },
    { provide: REMINDER_CREATE_REPOSITORY_PORT, useClass: ReminderCreateRepository },
    { provide: REMINDER_DELETE_REPOSITORY_PORT, useClass: ReminderDeleteRepository },
    { provide: REMINDER_GET_MANY_REPOSITORY_PORT, useClass: ReminderGetManyRepository },
    { provide: REMINDER_GET_SUMMARY_REPOSITORY_PORT, useClass: ReminderGetSummaryRepository },
    { provide: REMINDER_WRITE_REPOSITORY_PORT, useClass: ReminderWriteRepository },
    { provide: REMINDER_SUMMARY_PORT, useClass: ReminderSummaryCacheAdapter },
    ConfigValueProvider.provide({
      provide: REMINDER_OCC_RETRY_ATTEMPTS,
      property: 'OCC_RETRY_ATTEMPTS',
    }),
    ConfigValueProvider.provide({
      provide: REMINDER_SUMMARY_TTL_MS,
      property: 'CACHE_TTL_MS_DEFAULT',
    }),
  ],
})
export class ReminderModule {}
