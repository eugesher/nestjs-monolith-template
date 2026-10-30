import { Module } from '@nestjs/common';

import { StaffIdentityCommonModule } from '@acme-staff-common/modules/staff-identity';
import { HttpExceptionFilter } from '@acme-libs/http';
import {
  IamAssignRoleUseCase,
  IamListRolesUseCase,
  IamRegisterUserUseCase,
  IamUpdateRolePermissionsUseCase,
} from './application';
import { IamStaffIdentityCommonAdapter } from './infrastructure';
import { IAM_IDENTITY_PORT } from './outbound';
import { IamController } from './presentation';

@Module({
  imports: [StaffIdentityCommonModule],
  controllers: [IamController],
  providers: [
    HttpExceptionFilter,
    IamRegisterUserUseCase,
    IamAssignRoleUseCase,
    IamListRolesUseCase,
    IamUpdateRolePermissionsUseCase,
    { provide: IAM_IDENTITY_PORT, useClass: IamStaffIdentityCommonAdapter },
  ],
})
export class IamModule {}
