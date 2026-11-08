import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthPermissionGuard } from '../guards/auth-permission.guard';

@Module({
  providers: [{ provide: APP_GUARD, useClass: AuthPermissionGuard }],
})
export class AuthPermissionModule {}
