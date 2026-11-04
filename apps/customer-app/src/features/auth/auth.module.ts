import { Module } from '@nestjs/common';

import { ConfigProviderHelper } from '@acme-libs/config';
import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';
import { LedgerRecordQueueModule } from '@acme-customer/common/shared/ledger-record';

import { AuthLedgerService, AuthLoginUseCase, AuthRegisterUseCase } from './application';
import {
  AuthCredentialsLibAdapter,
  AuthLedgerRecordQueueAdapter,
  AuthLoginRepository,
  AuthRegisterRepository,
} from './infrastructure';
import {
  AUTH_CREDENTIALS_PORT,
  AUTH_LEDGER_RECORD_PORT,
  AUTH_LEDGER_RECORD_TIMEOUT_MS,
  AUTH_LEDGER_RETRY_ATTEMPTS,
  AUTH_LOGIN_REPOSITORY_PORT,
  AUTH_REGISTER_REPOSITORY_PORT,
} from './outbound';
import { AuthController } from './presentation';

@Module({
  imports: [CredentialsLibModule, LedgerRecordQueueModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    AuthRegisterUseCase,
    AuthLedgerService,
    { provide: AUTH_LOGIN_REPOSITORY_PORT, useClass: AuthLoginRepository },
    { provide: AUTH_REGISTER_REPOSITORY_PORT, useClass: AuthRegisterRepository },
    { provide: AUTH_LEDGER_RECORD_PORT, useClass: AuthLedgerRecordQueueAdapter },
    { provide: AUTH_CREDENTIALS_PORT, useClass: AuthCredentialsLibAdapter },
    ConfigProviderHelper.value(AUTH_LEDGER_RECORD_TIMEOUT_MS, 'REDIS_COMMAND_TIMEOUT_MS'),
    ConfigProviderHelper.value(AUTH_LEDGER_RETRY_ATTEMPTS, 'LEDGER_RETRY_ATTEMPTS'),
  ],
})
export class AuthModule {}
