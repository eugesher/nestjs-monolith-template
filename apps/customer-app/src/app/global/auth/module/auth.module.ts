import { Global, Module } from '@nestjs/common';

import { StaffIdentityCoreModule } from '@acme-core/modules/staff-identity';
import { AuthLibModule } from '@acme-libs/auth';
import { AUTH_USER_VALIDATOR_PORT } from '@acme-libs/contracts/auth';
import { AuthIdentityCoreAdapter } from '../infrastructure';
import { AuthFacade } from './auth.facade';

@Global()
@Module({
  imports: [AuthLibModule, StaffIdentityCoreModule],
  exports: [AUTH_USER_VALIDATOR_PORT],
  providers: [{ provide: AUTH_USER_VALIDATOR_PORT, useClass: AuthFacade }, AuthIdentityCoreAdapter],
})
export class AuthModule {}
