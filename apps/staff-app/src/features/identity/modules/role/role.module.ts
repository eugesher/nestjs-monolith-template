import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { RoleListUseCase, RoleReassignPermissionsUseCase } from './application';
import { RoleListRepository, RoleReassignPermissionsRepository } from './infrastructure';
import { RoleController } from './presentation';

@Module({
  controllers: [RoleController],
  providers: [
    HttpExceptionFilter,
    RoleListUseCase,
    RoleReassignPermissionsUseCase,
    RoleListRepository.provider,
    RoleReassignPermissionsRepository.provider,
  ],
})
export class RoleModule {}
