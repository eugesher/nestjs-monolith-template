import { Module } from '@nestjs/common';

import { StaffIdentityCoreModule } from '@acme-core/modules/staff-identity';
import { HttpExceptionFilter } from '@acme-libs/http';
import { SessionLoginUseCase, SessionMeUseCase } from './application';
import { SessionStaffIdentityCoreAdapter } from './infrastructure';
import { SESSION_IDENTITY_PORT } from './outbound';
import { SessionController } from './presentation';

@Module({
  imports: [StaffIdentityCoreModule],
  controllers: [SessionController],
  providers: [
    HttpExceptionFilter,
    SessionLoginUseCase,
    SessionMeUseCase,
    { provide: SESSION_IDENTITY_PORT, useClass: SessionStaffIdentityCoreAdapter },
  ],
})
export class SessionModule {}
