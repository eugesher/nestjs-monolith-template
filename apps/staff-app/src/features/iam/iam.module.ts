import { Module } from '@nestjs/common';

import { IdentityCoreModule } from '@acme-core/modules/identity';
import { HttpExceptionFilter } from '@acme-libs/http';
import {
  IamAssignRoleUseCase,
  IamListRolesUseCase,
  IamRegisterUserUseCase,
  IamUpdateRolePermissionsUseCase,
} from './application';
import { IamIdentityCoreAdapter } from './infrastructure';
import { IAM_IDENTITY_PORT } from './outbound';
import { IamController } from './presentation';

@Module({
  imports: [IdentityCoreModule],
  controllers: [IamController],
  providers: [
    HttpExceptionFilter,
    IamRegisterUserUseCase,
    IamAssignRoleUseCase,
    IamListRolesUseCase,
    IamUpdateRolePermissionsUseCase,
    { provide: IAM_IDENTITY_PORT, useClass: IamIdentityCoreAdapter },
  ],
})
export class IamModule {}
