import { Module } from '@nestjs/common';

import {
  STAFF_IDENTITY_CORE_ADMIN_PORT,
  STAFF_IDENTITY_CORE_SESSION_PORT,
} from '@acme-core/contracts/staff-identity';
import { ConfigProviderHelper } from '@acme-libs/config';
import {
  StaffIdentityCoreAccessTokenService,
  StaffIdentityCoreAssignRoleUseCase,
  StaffIdentityCoreFindPermissionCodesUseCase,
  StaffIdentityCoreListRolesUseCase,
  StaffIdentityCoreLoginUseCase,
  StaffIdentityCoreRegisterUserUseCase,
  StaffIdentityCoreUpdateRolePermissionsUseCase,
  StaffIdentityCoreValidateSubjectUseCase,
} from '../application';
import {
  StaffIdentityCoreAccessTokenAdapter,
  StaffIdentityCoreAccessTokenModule,
  StaffIdentityCoreAssignRoleRepository,
  StaffIdentityCoreFindPermissionCodesRepository,
  StaffIdentityCoreListRolesRepository,
  StaffIdentityCoreLoginRepository,
  StaffIdentityCorePasswordHasherAdapter,
  StaffIdentityCoreRegisterUserRepository,
  StaffIdentityCoreTypeOrmModule,
  StaffIdentityCoreUpdateRolePermissionsRepository,
  StaffIdentityCoreValidateSubjectRepository,
} from '../infrastructure';
import {
  STAFF_IDENTITY_CORE_ACCESS_TOKEN_EXPIRES_IN,
  STAFF_IDENTITY_CORE_ACCESS_TOKEN_PORT,
  STAFF_IDENTITY_CORE_ACCESS_TOKEN_SECRET,
  STAFF_IDENTITY_CORE_ASSIGN_ROLE_REPOSITORY_PORT,
  STAFF_IDENTITY_CORE_FIND_PERMISSION_CODES_REPOSITORY_PORT,
  STAFF_IDENTITY_CORE_LIST_ROLES_REPOSITORY_PORT,
  STAFF_IDENTITY_CORE_LOGIN_REPOSITORY_PORT,
  STAFF_IDENTITY_CORE_PASSWORD_HASHER_MEMORY_COST,
  STAFF_IDENTITY_CORE_PASSWORD_HASHER_PARALLELISM,
  STAFF_IDENTITY_CORE_PASSWORD_HASHER_PORT,
  STAFF_IDENTITY_CORE_PASSWORD_HASHER_TIME_COST,
  STAFF_IDENTITY_CORE_REGISTER_USER_REPOSITORY_PORT,
  STAFF_IDENTITY_CORE_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT,
  STAFF_IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT,
} from '../outbound';
import { StaffIdentityCoreAdminFacade } from './staff-identity-core-admin.facade';
import { StaffIdentityCoreSessionFacade } from './staff-identity-core-session.facade';

@Module({
  imports: [
    StaffIdentityCoreTypeOrmModule.forFeature(),
    StaffIdentityCoreAccessTokenModule.register(),
  ],
  exports: [STAFF_IDENTITY_CORE_ADMIN_PORT, STAFF_IDENTITY_CORE_SESSION_PORT],
  providers: [
    { provide: STAFF_IDENTITY_CORE_ADMIN_PORT, useClass: StaffIdentityCoreAdminFacade },
    { provide: STAFF_IDENTITY_CORE_SESSION_PORT, useClass: StaffIdentityCoreSessionFacade },
    StaffIdentityCoreAssignRoleUseCase,
    StaffIdentityCoreFindPermissionCodesUseCase,
    StaffIdentityCoreListRolesUseCase,
    StaffIdentityCoreLoginUseCase,
    StaffIdentityCoreRegisterUserUseCase,
    StaffIdentityCoreUpdateRolePermissionsUseCase,
    StaffIdentityCoreValidateSubjectUseCase,
    StaffIdentityCoreAccessTokenService,
    {
      provide: STAFF_IDENTITY_CORE_ASSIGN_ROLE_REPOSITORY_PORT,
      useClass: StaffIdentityCoreAssignRoleRepository,
    },
    {
      provide: STAFF_IDENTITY_CORE_FIND_PERMISSION_CODES_REPOSITORY_PORT,
      useClass: StaffIdentityCoreFindPermissionCodesRepository,
    },
    {
      provide: STAFF_IDENTITY_CORE_LIST_ROLES_REPOSITORY_PORT,
      useClass: StaffIdentityCoreListRolesRepository,
    },
    {
      provide: STAFF_IDENTITY_CORE_LOGIN_REPOSITORY_PORT,
      useClass: StaffIdentityCoreLoginRepository,
    },
    {
      provide: STAFF_IDENTITY_CORE_REGISTER_USER_REPOSITORY_PORT,
      useClass: StaffIdentityCoreRegisterUserRepository,
    },
    {
      provide: STAFF_IDENTITY_CORE_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT,
      useClass: StaffIdentityCoreUpdateRolePermissionsRepository,
    },
    {
      provide: STAFF_IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT,
      useClass: StaffIdentityCoreValidateSubjectRepository,
    },
    {
      provide: STAFF_IDENTITY_CORE_ACCESS_TOKEN_PORT,
      useClass: StaffIdentityCoreAccessTokenAdapter,
    },
    {
      provide: STAFF_IDENTITY_CORE_PASSWORD_HASHER_PORT,
      useClass: StaffIdentityCorePasswordHasherAdapter,
    },
    ConfigProviderHelper.value(STAFF_IDENTITY_CORE_ACCESS_TOKEN_EXPIRES_IN, 'JWT_EXPIRES_IN'),
    ConfigProviderHelper.value(STAFF_IDENTITY_CORE_ACCESS_TOKEN_SECRET, 'JWT_SECRET'),
    ConfigProviderHelper.value(
      STAFF_IDENTITY_CORE_PASSWORD_HASHER_MEMORY_COST,
      'AUTH_ARGON2_MEMORY_COST',
    ),
    ConfigProviderHelper.value(
      STAFF_IDENTITY_CORE_PASSWORD_HASHER_PARALLELISM,
      'AUTH_ARGON2_PARALLELISM',
    ),
    ConfigProviderHelper.value(
      STAFF_IDENTITY_CORE_PASSWORD_HASHER_TIME_COST,
      'AUTH_ARGON2_TIME_COST',
    ),
  ],
})
export class StaffIdentityCoreModule {}
