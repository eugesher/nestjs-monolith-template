import { Module } from '@nestjs/common';

import { CustomerIdentityCoreModule } from '@acme-core/modules/customer-identity';
import { HttpExceptionFilter } from '@acme-libs/http';
import { SessionLoginUseCase } from './application';
import { SessionCustomerIdentityCoreAdapter } from './infrastructure';
import { SESSION_IDENTITY_PORT } from './outbound';
import { SessionController } from './presentation';

@Module({
  imports: [CustomerIdentityCoreModule],
  controllers: [SessionController],
  providers: [
    HttpExceptionFilter,
    SessionLoginUseCase,
    { provide: SESSION_IDENTITY_PORT, useClass: SessionCustomerIdentityCoreAdapter },
  ],
})
export class SessionModule {}
