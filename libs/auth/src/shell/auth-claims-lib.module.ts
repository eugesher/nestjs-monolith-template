import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthPermissionsGuard } from '../guards/auth-permissions.guard';

@Module({
  providers: [{ provide: APP_GUARD, useClass: AuthPermissionsGuard }],
})
export class AuthClaimsLibModule {}
