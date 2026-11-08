import { Module } from '@nestjs/common';

import { AuthModule, PermissionModule, RoleModule, UserModule } from './modules';

@Module({
  imports: [AuthModule, PermissionModule, RoleModule, UserModule],
})
export class IdentityModule {}
