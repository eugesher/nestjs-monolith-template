import { Module } from '@nestjs/common';

import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';
import { LedgerLibModule } from '@acme-libs/ledger';

import { AuthLoginUseCase, AuthRegisterUseCase } from './application';
import {
  AuthCredentialsLibAdapter,
  AuthLedgerLibAdapter,
  AuthLoginRepository,
  AuthRegisterRepository,
} from './infrastructure';
import { AuthController } from './presentation';

@Module({
  imports: [CredentialsLibModule, LedgerLibModule],
  controllers: [AuthController],
  providers: [
    AuthLoginUseCase,
    AuthRegisterUseCase,
    AuthLoginRepository.provider,
    AuthRegisterRepository.provider,
    AuthCredentialsLibAdapter.provider,
    AuthLedgerLibAdapter.provider,
    HttpExceptionFilter,
  ],
})
export class AuthModule {}
