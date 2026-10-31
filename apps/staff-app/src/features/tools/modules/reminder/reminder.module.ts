import { Module } from '@nestjs/common';

import { ConfigProviderHelper } from '@acme-libs/config';
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
  ReminderCrudRepository,
  ReminderDeleteRepository,
  ReminderGetSummaryRepository,
  ReminderSummaryCacheAdapter,
  ReminderTypeOrmModule,
  ReminderWriteRepository,
} from './infrastructure';
import {
  REMINDER_ACCESS_REPOSITORY_PORT,
  REMINDER_CREATE_REPOSITORY_PORT,
  REMINDER_CRUD_REPOSITORY_PORT,
  REMINDER_DELETE_REPOSITORY_PORT,
  REMINDER_GET_SUMMARY_REPOSITORY_PORT,
  REMINDER_OCC_RETRY_ATTEMPTS,
  REMINDER_SUMMARY_PORT,
  REMINDER_SUMMARY_TTL_MS,
  REMINDER_WRITE_REPOSITORY_PORT,
} from './outbound';
import { ReminderController } from './presentation';

@Module({
  imports: [ReminderTypeOrmModule.forFeature()],
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
    { provide: REMINDER_CRUD_REPOSITORY_PORT, useClass: ReminderCrudRepository },
    { provide: REMINDER_DELETE_REPOSITORY_PORT, useClass: ReminderDeleteRepository },
    { provide: REMINDER_GET_SUMMARY_REPOSITORY_PORT, useClass: ReminderGetSummaryRepository },
    { provide: REMINDER_WRITE_REPOSITORY_PORT, useClass: ReminderWriteRepository },
    { provide: REMINDER_SUMMARY_PORT, useClass: ReminderSummaryCacheAdapter },
    ConfigProviderHelper.value(REMINDER_OCC_RETRY_ATTEMPTS, 'OCC_RETRY_ATTEMPTS'),
    ConfigProviderHelper.value(REMINDER_SUMMARY_TTL_MS, 'CACHE_TTL_MS_DEFAULT'),
  ],
})
export class ReminderModule {}
