import { Module } from '@nestjs/common';

import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';
import { StaffAuthCoreModule } from '@acme-core/modules/staff-auth';

import { AuthLoginUseCase } from './application';
import { AuthCredentialsLibAdapter, AuthIdentityCoreAdapter } from './infrastructure';
import { AUTH_CREDENTIALS_PORT, AUTH_IDENTITY_PORT } from './outbound';
import { AuthController } from './presentation';

@Module({
  imports: [CredentialsLibModule, StaffAuthCoreModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    { provide: AUTH_IDENTITY_PORT, useClass: AuthIdentityCoreAdapter },
    { provide: AUTH_CREDENTIALS_PORT, useClass: AuthCredentialsLibAdapter },
  ],
})
export class AuthModule {}
