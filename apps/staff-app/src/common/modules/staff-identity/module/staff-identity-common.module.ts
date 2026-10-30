import { Module } from '@nestjs/common';

import {
  STAFF_IDENTITY_COMMON_ADMIN_PORT,
  STAFF_IDENTITY_COMMON_AUTH_PORT,
} from '@acme-staff-contracts/staff-identity';
import { CredentialsLibModule } from '@acme-libs/credentials';
import {
  StaffIdentityCommonAccessTokenService,
  StaffIdentityCommonAssignRoleUseCase,
  StaffIdentityCommonFindPermissionCodesUseCase,
  StaffIdentityCommonListRolesUseCase,
  StaffIdentityCommonLoginUseCase,
  StaffIdentityCommonRegisterUserUseCase,
  StaffIdentityCommonUpdateRolePermissionsUseCase,
  StaffIdentityCommonValidateSubjectUseCase,
} from '../application';
import {
  StaffIdentityCommonAssignRoleRepository,
  StaffIdentityCommonFindPermissionCodesRepository,
  StaffIdentityCommonListRolesRepository,
  StaffIdentityCommonLoginRepository,
  StaffIdentityCommonRegisterUserRepository,
  StaffIdentityCommonTypeOrmModule,
  StaffIdentityCommonUpdateRolePermissionsRepository,
  StaffIdentityCommonValidateSubjectRepository,
} from '../infrastructure';
import {
  STAFF_IDENTITY_COMMON_ASSIGN_ROLE_REPOSITORY_PORT,
  STAFF_IDENTITY_COMMON_FIND_PERMISSION_CODES_REPOSITORY_PORT,
  STAFF_IDENTITY_COMMON_LIST_ROLES_REPOSITORY_PORT,
  STAFF_IDENTITY_COMMON_LOGIN_REPOSITORY_PORT,
  STAFF_IDENTITY_COMMON_REGISTER_USER_REPOSITORY_PORT,
  STAFF_IDENTITY_COMMON_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT,
  STAFF_IDENTITY_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT,
} from '../outbound';
import { StaffIdentityCommonAdminFacade } from './staff-identity-common-admin.facade';
import { StaffIdentityCommonAuthFacade } from './staff-identity-common-auth.facade';

@Module({
  imports: [StaffIdentityCommonTypeOrmModule.forFeature(), CredentialsLibModule],
  exports: [STAFF_IDENTITY_COMMON_ADMIN_PORT, STAFF_IDENTITY_COMMON_AUTH_PORT],
  providers: [
    { provide: STAFF_IDENTITY_COMMON_ADMIN_PORT, useClass: StaffIdentityCommonAdminFacade },
    { provide: STAFF_IDENTITY_COMMON_AUTH_PORT, useClass: StaffIdentityCommonAuthFacade },
    StaffIdentityCommonAssignRoleUseCase,
    StaffIdentityCommonFindPermissionCodesUseCase,
    StaffIdentityCommonListRolesUseCase,
    StaffIdentityCommonLoginUseCase,
    StaffIdentityCommonRegisterUserUseCase,
    StaffIdentityCommonUpdateRolePermissionsUseCase,
    StaffIdentityCommonValidateSubjectUseCase,
    StaffIdentityCommonAccessTokenService,
    {
      provide: STAFF_IDENTITY_COMMON_ASSIGN_ROLE_REPOSITORY_PORT,
      useClass: StaffIdentityCommonAssignRoleRepository,
    },
    {
      provide: STAFF_IDENTITY_COMMON_FIND_PERMISSION_CODES_REPOSITORY_PORT,
      useClass: StaffIdentityCommonFindPermissionCodesRepository,
    },
    {
      provide: STAFF_IDENTITY_COMMON_LIST_ROLES_REPOSITORY_PORT,
      useClass: StaffIdentityCommonListRolesRepository,
    },
    {
      provide: STAFF_IDENTITY_COMMON_LOGIN_REPOSITORY_PORT,
      useClass: StaffIdentityCommonLoginRepository,
    },
    {
      provide: STAFF_IDENTITY_COMMON_REGISTER_USER_REPOSITORY_PORT,
      useClass: StaffIdentityCommonRegisterUserRepository,
    },
    {
      provide: STAFF_IDENTITY_COMMON_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT,
      useClass: StaffIdentityCommonUpdateRolePermissionsRepository,
    },
    {
      provide: STAFF_IDENTITY_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT,
      useClass: StaffIdentityCommonValidateSubjectRepository,
    },
  ],
})
export class StaffIdentityCommonModule {}
