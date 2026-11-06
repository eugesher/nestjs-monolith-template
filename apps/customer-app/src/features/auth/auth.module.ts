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
import { AUTH_REDIS_COMMAND_TIMEOUT_MS_TOKEN, AUTH_LEDGER_RETRY_ATTEMPTS_TOKEN } from './outbound';
import { AuthController } from './presentation';

@Module({
  imports: [CredentialsLibModule, LedgerRecordQueueModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    AuthRegisterUseCase,
    AuthLedgerService,
    AuthLoginRepository.provider,
    AuthRegisterRepository.provider,
    AuthLedgerQueueAdapter.provider,
    AuthCredentialsLibAdapter.provider,
    ConfigValueProvider.provide({
      provide: AUTH_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      property: 'REDIS_COMMAND_TIMEOUT_MS',
    }),
    ConfigValueProvider.provide({
      provide: AUTH_LEDGER_RETRY_ATTEMPTS_TOKEN,
      property: 'LEDGER_RETRY_ATTEMPTS',
    }),
  ],
})
export class AuthModule {}
