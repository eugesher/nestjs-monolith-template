import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import type { DynamicModule } from '@nestjs/common';

import type { AuthAudienceEnum } from '@acme-libs/kernel';

import { AuthJwtGuard } from '../guards/auth-jwt.guard';

export class AuthJwtModule {
  public static forRoot(audience: AuthAudienceEnum): DynamicModule {
    return {
      module: AuthJwtModule,
      imports: [
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.getOrThrow<string>('JWT_SECRET'),
            verifyOptions: { algorithms: ['HS256'], audience },
          }),
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: AuthJwtGuard }],
    };
  }
}
