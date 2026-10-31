import { Module } from '@nestjs/common';

import { AuthCommonModule } from '@acme-staff-common/modules/auth';
import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';
import { AuthAccessTokenService, AuthLoginUseCase, AuthMeUseCase } from './application';
import {
  AuthIdentityCommonAdapter,
  AuthLoginRepository,
  AuthTypeOrmModule,
} from './infrastructure';
import { AUTH_IDENTITY_PORT, AUTH_LOGIN_REPOSITORY_PORT } from './outbound';
import { AuthController } from './presentation';

@Module({
  imports: [AuthTypeOrmModule.forFeature(), CredentialsLibModule, AuthCommonModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    AuthMeUseCase,
    AuthAccessTokenService,
    { provide: AUTH_LOGIN_REPOSITORY_PORT, useClass: AuthLoginRepository },
    { provide: AUTH_IDENTITY_PORT, useClass: AuthIdentityCommonAdapter },
  ],
})
export class AuthModule {}
