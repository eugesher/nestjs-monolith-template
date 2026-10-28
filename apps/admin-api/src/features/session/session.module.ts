import { Module } from '@nestjs/common';

import { IdentityCoreModule } from '@acme-core/modules/identity';
import { HttpExceptionFilter } from '@acme-libs/http';
import { SessionLoginUseCase, SessionRefreshUseCase } from './application';
import { SessionIdentityCoreAdapter } from './infrastructure';
import { SESSION_IDENTITY_PORT } from './outbound';
import { SessionController } from './presentation';

@Module({
  imports: [IdentityCoreModule],
  controllers: [SessionController],
  providers: [
    HttpExceptionFilter,
    SessionLoginUseCase,
    SessionRefreshUseCase,
    { provide: SESSION_IDENTITY_PORT, useClass: SessionIdentityCoreAdapter },
  ],
})
export class SessionModule {}
