import { Module } from '@nestjs/common';

import { StaffIdentityCommonModule } from '@acme-staff-common/modules/staff-identity';
import { HttpExceptionFilter } from '@acme-libs/http';
import { AuthLoginUseCase, AuthMeUseCase } from './application';
import { AuthStaffIdentityCommonAdapter } from './infrastructure';
import { AUTH_IDENTITY_PORT } from './outbound';
import { AuthController } from './presentation';

@Module({
  imports: [StaffIdentityCommonModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    AuthMeUseCase,
    { provide: AUTH_IDENTITY_PORT, useClass: AuthStaffIdentityCommonAdapter },
  ],
})
export class AuthModule {}
