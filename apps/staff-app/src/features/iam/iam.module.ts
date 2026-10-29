import { Module } from '@nestjs/common';

import { StaffIdentityCoreModule } from '@acme-core/modules/staff-identity';
import { HttpExceptionFilter } from '@acme-libs/http';
import {
  IamAssignRoleUseCase,
  IamListRolesUseCase,
  IamRegisterUserUseCase,
  IamUpdateRolePermissionsUseCase,
} from './application';
import { IamStaffIdentityCoreAdapter } from './infrastructure';
import { IAM_IDENTITY_PORT } from './outbound';
import { IamController } from './presentation';

@Module({
  imports: [StaffIdentityCoreModule],
  controllers: [IamController],
  providers: [
    HttpExceptionFilter,
    IamRegisterUserUseCase,
    IamAssignRoleUseCase,
    IamListRolesUseCase,
    IamUpdateRolePermissionsUseCase,
    { provide: IAM_IDENTITY_PORT, useClass: IamStaffIdentityCoreAdapter },
  ],
})
export class IamModule {}
