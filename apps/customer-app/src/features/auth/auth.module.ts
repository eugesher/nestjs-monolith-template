import { Module } from '@nestjs/common';

import { LedgerRecordQueueModule } from '@acme-customer-common/shared/ledger-record';
import { CustomerIdentityCoreModule } from '@acme-core/modules/customer-identity';
import { ConfigProviderHelper } from '@acme-libs/config';
import { HttpExceptionFilter } from '@acme-libs/http';
import { AuthLedgerService, AuthLoginUseCase, AuthRegisterUseCase } from './application';
import { AuthCustomerIdentityCoreAdapter, AuthLedgerRecordQueueAdapter } from './infrastructure';
import {
  AUTH_IDENTITY_PORT,
  AUTH_LEDGER_RECORD_PORT,
  AUTH_LEDGER_RECORD_TIMEOUT_MS,
  AUTH_LEDGER_RETRY_ATTEMPTS,
} from './outbound';
import { AuthController } from './presentation';

@Module({
  imports: [CustomerIdentityCoreModule, LedgerRecordQueueModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    AuthRegisterUseCase,
    AuthLedgerService,
    { provide: AUTH_IDENTITY_PORT, useClass: AuthCustomerIdentityCoreAdapter },
    { provide: AUTH_LEDGER_RECORD_PORT, useClass: AuthLedgerRecordQueueAdapter },
    ConfigProviderHelper.value(AUTH_LEDGER_RECORD_TIMEOUT_MS, 'REDIS_COMMAND_TIMEOUT_MS'),
    ConfigProviderHelper.value(AUTH_LEDGER_RETRY_ATTEMPTS, 'LEDGER_RETRY_ATTEMPTS'),
  ],
})
export class AuthModule {}
