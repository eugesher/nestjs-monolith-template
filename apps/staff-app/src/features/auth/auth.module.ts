import { Module } from '@nestjs/common';

import { StaffIdentityCoreModule } from '@acme-core/modules/staff-identity';
import { HttpExceptionFilter } from '@acme-libs/http';
import { AuthLoginUseCase, AuthMeUseCase } from './application';
import { AuthStaffIdentityCoreAdapter } from './infrastructure';
import { AUTH_IDENTITY_PORT } from './outbound';
import { AuthController } from './presentation';

@Module({
  imports: [StaffIdentityCoreModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    AuthMeUseCase,
    { provide: AUTH_IDENTITY_PORT, useClass: AuthStaffIdentityCoreAdapter },
  ],
})
export class AuthModule {}
