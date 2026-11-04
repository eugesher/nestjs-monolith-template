import { Module } from '@nestjs/common';

import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';
import { AuthCommonModule } from '@acme-staff/common/modules/auth';

import { AuthLoginUseCase, AuthMeUseCase } from './application';
import {
  AuthCredentialsLibAdapter,
  AuthIdentityCommonAdapter,
  AuthLoginRepository,
} from './infrastructure';
import { AUTH_CREDENTIALS_PORT, AUTH_IDENTITY_PORT, AUTH_LOGIN_REPOSITORY_PORT } from './outbound';
import { AuthController } from './presentation';

@Module({
  imports: [CredentialsLibModule, AuthCommonModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    AuthMeUseCase,
    { provide: AUTH_LOGIN_REPOSITORY_PORT, useClass: AuthLoginRepository },
    { provide: AUTH_IDENTITY_PORT, useClass: AuthIdentityCommonAdapter },
    { provide: AUTH_CREDENTIALS_PORT, useClass: AuthCredentialsLibAdapter },
  ],
})
export class AuthModule {}
