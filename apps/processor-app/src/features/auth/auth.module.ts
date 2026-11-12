import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { StaffAuthCoreModule } from '@acme-core/modules/staff-auth';

import { AuthLoginUseCase } from './application';
import { AuthIdentityCoreAdapter } from './infrastructure';
import { AuthController } from './presentation';

@Module({
  imports: [StaffAuthCoreModule],
  controllers: [AuthController],
  providers: [HttpExceptionFilter, AuthLoginUseCase, AuthIdentityCoreAdapter.provider],
})
export class AuthModule {}
