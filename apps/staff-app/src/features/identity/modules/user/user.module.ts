import { Module } from '@nestjs/common';

import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';

import { UserAssignRoleUseCase, UserRegisterUseCase } from './application';
import {
  UserAssignRoleRepository,
  UserPasswordHasherLibAdapter,
  UserRegisterRepository,
} from './infrastructure';
import {
  USER_ASSIGN_ROLE_REPOSITORY_PORT,
  USER_PASSWORD_HASHER_PORT,
  USER_REGISTER_REPOSITORY_PORT,
} from './outbound';
import { UserController } from './presentation';

@Module({
  imports: [CredentialsLibModule],
  controllers: [UserController],
  providers: [
    HttpExceptionFilter,
    UserRegisterUseCase,
    UserAssignRoleUseCase,
    { provide: USER_ASSIGN_ROLE_REPOSITORY_PORT, useClass: UserAssignRoleRepository },
    { provide: USER_REGISTER_REPOSITORY_PORT, useClass: UserRegisterRepository },
    { provide: USER_PASSWORD_HASHER_PORT, useClass: UserPasswordHasherLibAdapter },
  ],
})
export class UserModule {}
