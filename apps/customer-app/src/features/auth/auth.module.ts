import { Module } from '@nestjs/common';

import { ConfigValueProvider } from '@acme-libs/config';
import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';
import { LedgerRecordQueueModule } from '@acme-customer/common/shared/ledger-record';

import { AuthLedgerService, AuthLoginUseCase, AuthRegisterUseCase } from './application';
import {
  AuthCredentialsLibAdapter,
  AuthLedgerQueueAdapter,
  AuthLoginRepository,
  AuthRegisterRepository,
} from './infrastructure';
import {
  AUTH_CREDENTIALS_PORT,
  AUTH_LEDGER_RECORD_PORT,
  AUTH_LEDGER_TIMEOUT_MS_TOKEN,
  AUTH_LEDGER_RETRY_ATTEMPTS_TOKEN,
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
    { provide: AUTH_LEDGER_RECORD_PORT, useClass: AuthLedgerQueueAdapter },
    { provide: AUTH_CREDENTIALS_PORT, useClass: AuthCredentialsLibAdapter },
    ConfigValueProvider.provide({
      provide: AUTH_LEDGER_TIMEOUT_MS_TOKEN,
      property: 'REDIS_COMMAND_TIMEOUT_MS',
    }),
    ConfigValueProvider.provide({
      provide: AUTH_LEDGER_RETRY_ATTEMPTS_TOKEN,
      property: 'LEDGER_RETRY_ATTEMPTS',
    }),
  ],
})
export class AuthModule {}
