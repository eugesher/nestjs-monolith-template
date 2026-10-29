import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthPermissionsGuard } from '../guards/auth-permissions.guard';
import { AuthRolesGuard } from '../guards/auth-roles.guard';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: AuthRolesGuard },
    { provide: APP_GUARD, useClass: AuthPermissionsGuard },
  ],
})
export class AuthClaimsLibModule {}
