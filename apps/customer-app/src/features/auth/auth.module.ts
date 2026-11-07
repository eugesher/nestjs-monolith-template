import { Module } from '@nestjs/common';

import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';
import { LedgerQueueSetupModule } from '@acme-customer/common/shared';

import { AuthLedgerService, AuthLoginUseCase, AuthRegisterUseCase } from './application';
import {
  AuthConfigLedgerRetryAttemptsProvider,
  AuthConfigRedisCommandTimeoutMsProvider,
  AuthCredentialsLibAdapter,
  AuthLedgerQueueAdapter,
  AuthLoginRepository,
  AuthRegisterRepository,
} from './infrastructure';
import { AuthController } from './presentation';

@Module({
  imports: [CredentialsLibModule, LedgerQueueSetupModule],
  controllers: [AuthController],
  providers: [
    HttpExceptionFilter,
    AuthLoginUseCase,
    AuthRegisterUseCase,
    AuthLedgerService,
    AuthLoginRepository.provider,
    AuthRegisterRepository.provider,
    AuthLedgerQueueAdapter.provider,
    AuthCredentialsLibAdapter.provider,
    AuthConfigRedisCommandTimeoutMsProvider,
    AuthConfigLedgerRetryAttemptsProvider,
  ],
})
export class AuthModule {}
