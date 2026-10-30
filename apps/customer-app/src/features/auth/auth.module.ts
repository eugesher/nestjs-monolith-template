import { Module } from '@nestjs/common';

import { LedgerRecordQueueModule } from '@acme-customer-common/shared/ledger-record';
import { ConfigProviderHelper } from '@acme-libs/config';
import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';
import {
  AuthAccessTokenService,
  AuthLedgerService,
  AuthLoginUseCase,
  AuthRegisterUseCase,
} from './application';
import {
  AuthLedgerRecordQueueAdapter,
  AuthLoginRepository,
  AuthRegisterRepository,
  AuthTypeOrmModule,
} from './infrastructure';
import {
  AUTH_LEDGER_RECORD_PORT,
  AUTH_LEDGER_RECORD_TIMEOUT_MS,
  AUTH_LEDGER_RETRY_ATTEMPTS,
  AUTH_LOGIN_REPOSITORY_PORT,
  AUTH_REGISTER_REPOSITORY_PORT,
} from './outbound';
import { AuthController } from './presentation';

@Module({
  imports: [AuthTypeOrmModule.forFeature(), CredentialsLibModule, LedgerRecordQueueModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    AuthRegisterUseCase,
    AuthAccessTokenService,
    AuthLedgerService,
    { provide: AUTH_LOGIN_REPOSITORY_PORT, useClass: AuthLoginRepository },
    { provide: AUTH_REGISTER_REPOSITORY_PORT, useClass: AuthRegisterRepository },
    { provide: AUTH_LEDGER_RECORD_PORT, useClass: AuthLedgerRecordQueueAdapter },
    ConfigProviderHelper.value(AUTH_LEDGER_RECORD_TIMEOUT_MS, 'REDIS_COMMAND_TIMEOUT_MS'),
    ConfigProviderHelper.value(AUTH_LEDGER_RETRY_ATTEMPTS, 'LEDGER_RETRY_ATTEMPTS'),
  ],
})
export class AuthModule {}
