import { Module } from '@nestjs/common';

import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';
import { AuthAudienceEnum } from '@acme-libs/kernel';

import { UserReassignRolesUseCase, UserRegisterUseCase } from './application';
import {
  UserCredentialsLibAdapter,
  UserReassignRolesRepository,
  UserRegisterRepository,
  UserTransactionAdapter,
} from './infrastructure';
import { UserController } from './presentation';

@Module({
  imports: [CredentialsLibModule.register(AuthAudienceEnum.STAFF)],
  controllers: [UserController],
  providers: [
    HttpExceptionFilter,
    UserRegisterUseCase,
    UserReassignRolesUseCase,
    UserReassignRolesRepository.provider,
    UserRegisterRepository.provider,
    UserCredentialsLibAdapter.provider,
    UserTransactionAdapter.provider,
  ],
})
export class UserModule {}
