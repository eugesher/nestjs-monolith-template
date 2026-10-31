import { Module } from '@nestjs/common';

import { AuthModule, RoleModule, UserModule } from './modules';

@Module({
  imports: [AuthModule, RoleModule, UserModule],
})
export class IdentityModule {}
