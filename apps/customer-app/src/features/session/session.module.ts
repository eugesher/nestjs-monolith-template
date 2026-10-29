import { Module } from '@nestjs/common';

import { StaffIdentityCoreModule } from '@acme-core/modules/staff-identity';
import { HttpExceptionFilter } from '@acme-libs/http';
import { SessionLoginUseCase } from './application';
import { SessionIdentityCoreAdapter } from './infrastructure';
import { SESSION_IDENTITY_PORT } from './outbound';
import { SessionController } from './presentation';

@Module({
  imports: [StaffIdentityCoreModule],
  controllers: [SessionController],
  providers: [
    HttpExceptionFilter,
    SessionLoginUseCase,
    { provide: SESSION_IDENTITY_PORT, useClass: SessionIdentityCoreAdapter },
  ],
})
export class SessionModule {}
