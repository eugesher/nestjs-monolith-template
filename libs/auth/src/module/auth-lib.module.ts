import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AuthJwtGuard } from '../guards/auth-jwt.guard';
import { AuthPermissionsGuard } from '../guards/auth-permissions.guard';
import { AuthRolesGuard } from '../guards/auth-roles.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthJwtGuard },
    { provide: APP_GUARD, useClass: AuthRolesGuard },
    { provide: APP_GUARD, useClass: AuthPermissionsGuard },
  ],
})
export class AuthLibModule {}
