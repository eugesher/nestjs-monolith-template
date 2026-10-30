import { Module } from '@nestjs/common';

import { CredentialsLibModule } from '@acme-libs/credentials';
import { HttpExceptionFilter } from '@acme-libs/http';
import {
  IamAssignRoleUseCase,
  IamListRolesUseCase,
  IamRegisterUserUseCase,
  IamUpdateRolePermissionsUseCase,
} from './application';
import {
  IamAssignRoleRepository,
  IamListRolesRepository,
  IamRegisterUserRepository,
  IamTypeOrmModule,
  IamUpdateRolePermissionsRepository,
} from './infrastructure';
import {
  IAM_ASSIGN_ROLE_REPOSITORY_PORT,
  IAM_LIST_ROLES_REPOSITORY_PORT,
  IAM_REGISTER_USER_REPOSITORY_PORT,
  IAM_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT,
} from './outbound';
import { IamController } from './presentation';

@Module({
  imports: [IamTypeOrmModule.forFeature(), CredentialsLibModule],
  controllers: [IamController],
  providers: [
    HttpExceptionFilter,
    IamRegisterUserUseCase,
    IamAssignRoleUseCase,
    IamListRolesUseCase,
    IamUpdateRolePermissionsUseCase,
    { provide: IAM_ASSIGN_ROLE_REPOSITORY_PORT, useClass: IamAssignRoleRepository },
    { provide: IAM_LIST_ROLES_REPOSITORY_PORT, useClass: IamListRolesRepository },
    { provide: IAM_REGISTER_USER_REPOSITORY_PORT, useClass: IamRegisterUserRepository },
    {
      provide: IAM_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT,
      useClass: IamUpdateRolePermissionsRepository,
    },
  ],
})
export class IamModule {}
