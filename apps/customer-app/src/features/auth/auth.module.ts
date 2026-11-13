import { Module } from '@nestjs/common';

import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';
import { AuthAudienceEnum } from '@acme-libs/kernel';
import { LedgerCoreModule } from '@acme-core/modules/ledger';

import { AuthLoginUseCase, AuthRegisterUseCase } from './application';
import {
  AuthCredentialsLibAdapter,
  AuthLedgerCoreAdapter,
  AuthLoginRepository,
  AuthRegisterRepository,
} from './infrastructure';
import { AuthController } from './presentation';

@Module({
  imports: [CredentialsLibModule.register(AuthAudienceEnum.CUSTOMER), LedgerCoreModule],
  controllers: [AuthController],
  providers: [
    AuthLoginUseCase,
    AuthRegisterUseCase,
    AuthLoginRepository.provider,
    AuthRegisterRepository.provider,
    AuthCredentialsLibAdapter.provider,
    AuthLedgerCoreAdapter.provider,
    HttpExceptionFilter,
  ],
})
export class AuthModule {}
