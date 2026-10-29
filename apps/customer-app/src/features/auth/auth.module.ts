import { Module } from '@nestjs/common';

import { CustomerIdentityCoreModule } from '@acme-core/modules/customer-identity';
import { LedgerCoreModule } from '@acme-core/modules/ledger';
import { HttpExceptionFilter } from '@acme-libs/http';
import { AuthLedgerService, AuthLoginUseCase, AuthRegisterUseCase } from './application';
import { AuthCustomerIdentityCoreAdapter, AuthLedgerCoreAdapter } from './infrastructure';
import { AUTH_IDENTITY_PORT, AUTH_LEDGER_PORT } from './outbound';
import { AuthController } from './presentation';

@Module({
  imports: [CustomerIdentityCoreModule, LedgerCoreModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    AuthRegisterUseCase,
    AuthLedgerService,
    { provide: AUTH_IDENTITY_PORT, useClass: AuthCustomerIdentityCoreAdapter },
    { provide: AUTH_LEDGER_PORT, useClass: AuthLedgerCoreAdapter },
  ],
})
export class AuthModule {}
