import { Module } from '@nestjs/common';

import {
  IDENTITY_CORE_ADMIN_PORT,
  IDENTITY_CORE_SESSION_PORT,
} from '@acme-core/contracts/identity';
import { ConfigProviderHelper } from '@acme-libs/config';
import {
  IdentityCoreAccessTokenService,
  IdentityCoreAssignRoleUseCase,
  IdentityCoreListRolesUseCase,
  IdentityCoreLoginUseCase,
  IdentityCoreRegisterUserUseCase,
  IdentityCoreUpdateRolePermissionsUseCase,
  IdentityCoreValidateSubjectUseCase,
} from '../application';
import {
  IdentityCoreAccessTokenAdapter,
  IdentityCoreAccessTokenModule,
  IdentityCoreAssignRoleRepository,
  IdentityCoreListRolesRepository,
  IdentityCoreLoginRepository,
  IdentityCorePasswordHasherAdapter,
  IdentityCoreRegisterUserRepository,
  IdentityCoreTypeOrmModule,
  IdentityCoreUpdateRolePermissionsRepository,
  IdentityCoreValidateSubjectRepository,
} from '../infrastructure';
import {
  IDENTITY_CORE_ACCESS_TOKEN_EXPIRES_IN,
  IDENTITY_CORE_ACCESS_TOKEN_PORT,
  IDENTITY_CORE_ACCESS_TOKEN_SECRET,
  IDENTITY_CORE_ASSIGN_ROLE_REPOSITORY_PORT,
  IDENTITY_CORE_LIST_ROLES_REPOSITORY_PORT,
  IDENTITY_CORE_LOGIN_REPOSITORY_PORT,
  IDENTITY_CORE_PASSWORD_HASHER_MEMORY_COST,
  IDENTITY_CORE_PASSWORD_HASHER_PARALLELISM,
  IDENTITY_CORE_PASSWORD_HASHER_PORT,
  IDENTITY_CORE_PASSWORD_HASHER_TIME_COST,
  IDENTITY_CORE_REGISTER_USER_REPOSITORY_PORT,
  IDENTITY_CORE_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT,
  IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT,
} from '../outbound';
import { IdentityCoreAdminFacade } from './identity-core-admin.facade';
import { IdentityCoreSessionFacade } from './identity-core-session.facade';

@Module({
  imports: [IdentityCoreTypeOrmModule.forFeature(), IdentityCoreAccessTokenModule.register()],
  exports: [IDENTITY_CORE_ADMIN_PORT, IDENTITY_CORE_SESSION_PORT],
  providers: [
    { provide: IDENTITY_CORE_ADMIN_PORT, useClass: IdentityCoreAdminFacade },
    { provide: IDENTITY_CORE_SESSION_PORT, useClass: IdentityCoreSessionFacade },
    IdentityCoreAssignRoleUseCase,
    IdentityCoreListRolesUseCase,
    IdentityCoreLoginUseCase,
    IdentityCoreRegisterUserUseCase,
    IdentityCoreUpdateRolePermissionsUseCase,
    IdentityCoreValidateSubjectUseCase,
    IdentityCoreAccessTokenService,
    {
      provide: IDENTITY_CORE_ASSIGN_ROLE_REPOSITORY_PORT,
      useClass: IdentityCoreAssignRoleRepository,
    },
    {
      provide: IDENTITY_CORE_LIST_ROLES_REPOSITORY_PORT,
      useClass: IdentityCoreListRolesRepository,
    },
    { provide: IDENTITY_CORE_LOGIN_REPOSITORY_PORT, useClass: IdentityCoreLoginRepository },
    {
      provide: IDENTITY_CORE_REGISTER_USER_REPOSITORY_PORT,
      useClass: IdentityCoreRegisterUserRepository,
    },
    {
      provide: IDENTITY_CORE_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT,
      useClass: IdentityCoreUpdateRolePermissionsRepository,
    },
    {
      provide: IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT,
      useClass: IdentityCoreValidateSubjectRepository,
    },
    { provide: IDENTITY_CORE_ACCESS_TOKEN_PORT, useClass: IdentityCoreAccessTokenAdapter },
    { provide: IDENTITY_CORE_PASSWORD_HASHER_PORT, useClass: IdentityCorePasswordHasherAdapter },
    ConfigProviderHelper.value(IDENTITY_CORE_ACCESS_TOKEN_EXPIRES_IN, 'JWT_EXPIRES_IN'),
    ConfigProviderHelper.value(IDENTITY_CORE_ACCESS_TOKEN_SECRET, 'JWT_SECRET'),
    ConfigProviderHelper.value(
      IDENTITY_CORE_PASSWORD_HASHER_MEMORY_COST,
      'AUTH_ARGON2_MEMORY_COST',
    ),
    ConfigProviderHelper.value(
      IDENTITY_CORE_PASSWORD_HASHER_PARALLELISM,
      'AUTH_ARGON2_PARALLELISM',
    ),
    ConfigProviderHelper.value(IDENTITY_CORE_PASSWORD_HASHER_TIME_COST, 'AUTH_ARGON2_TIME_COST'),
  ],
})
export class IdentityCoreModule {}
