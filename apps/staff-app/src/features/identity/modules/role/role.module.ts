import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { RoleListUseCase, RoleUpdatePermissionsUseCase } from './application';
import { RoleListRepository, RoleUpdatePermissionsRepository } from './infrastructure';
import { RoleController } from './presentation';

@Module({
  controllers: [RoleController],
  providers: [
    HttpExceptionFilter,
    RoleListUseCase,
    RoleUpdatePermissionsUseCase,
    RoleListRepository.provider,
    RoleUpdatePermissionsRepository.provider,
  ],
})
export class RoleModule {}
