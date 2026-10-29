import { Module } from '@nestjs/common';

import { CustomerIdentityCoreModule } from '@acme-core/modules/customer-identity';
import { HttpExceptionFilter } from '@acme-libs/http';
import { AuthLoginUseCase, AuthRegisterUseCase } from './application';
import { AuthCustomerIdentityCoreAdapter } from './infrastructure';
import { AUTH_IDENTITY_PORT } from './outbound';
import { AuthController } from './presentation';

@Module({
  imports: [CustomerIdentityCoreModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    AuthRegisterUseCase,
    { provide: AUTH_IDENTITY_PORT, useClass: AuthCustomerIdentityCoreAdapter },
  ],
})
export class AuthModule {}
