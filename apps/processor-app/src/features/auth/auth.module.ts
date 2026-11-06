import { Module } from '@nestjs/common';

import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';
import { StaffAuthCoreModule } from '@acme-core/modules/staff-auth';

import { AuthLoginUseCase } from './application';
import { AuthCredentialsLibAdapter, AuthIdentityCoreAdapter } from './infrastructure';
import { AuthController } from './presentation';

@Module({
  imports: [CredentialsLibModule, StaffAuthCoreModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    AuthIdentityCoreAdapter.provider,
    AuthCredentialsLibAdapter.provider,
  ],
})
export class AuthModule {}
