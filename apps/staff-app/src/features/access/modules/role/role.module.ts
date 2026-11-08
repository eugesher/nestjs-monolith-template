import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { RoleCreateUseCase, RoleListUseCase, RoleReassignPermissionsUseCase } from './application';
import {
  RoleCreateRepository,
  RoleListRepository,
  RoleReassignPermissionsRepository,
} from './infrastructure';
import { RoleController } from './presentation';

@Module({
  controllers: [RoleController],
  providers: [
    HttpExceptionFilter,
    RoleListUseCase,
    RoleCreateUseCase,
    RoleReassignPermissionsUseCase,
    RoleListRepository.provider,
    RoleCreateRepository.provider,
    RoleReassignPermissionsRepository.provider,
  ],
})
export class RoleModule {}
