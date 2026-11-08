import { Module } from '@nestjs/common';

import { PermissionModule, RoleModule, UserModule } from './modules';

@Module({
  imports: [PermissionModule, RoleModule, UserModule],
})
export class AccessModule {}
