import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { RoleListUseCase, RoleUpdatePermissionsUseCase } from './application';
import {
  RoleListRepository,
  RoleTypeOrmModule,
  RoleUpdatePermissionsRepository,
} from './infrastructure';
import { ROLE_LIST_REPOSITORY_PORT, ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT } from './outbound';
import { RoleController } from './presentation';

@Module({
  imports: [RoleTypeOrmModule.forFeature()],
  controllers: [RoleController],
  providers: [
    HttpExceptionFilter,
    RoleListUseCase,
    RoleUpdatePermissionsUseCase,
    { provide: ROLE_LIST_REPOSITORY_PORT, useClass: RoleListRepository },
    { provide: ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT, useClass: RoleUpdatePermissionsRepository },
  ],
})
export class RoleModule {}
