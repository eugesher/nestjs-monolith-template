import { ConfigService } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { getOptionsToken, getStorageToken, type ThrottlerModuleOptions } from '@nestjs/throttler';
import type { DynamicModule, ExecutionContext } from '@nestjs/common';

import type { Maybe } from '@acme-libs/toolkit';

import { ThrottleMetadataKeyEnum } from './enums/throttle-metadata-key.enum';
import { ThrottleGuard } from './guards/throttle.guard';
import { ThrottleTrustProxySetup } from './proxy/throttle-trust-proxy.setup';
import { ThrottleRedisStorage } from './storage/throttle-redis.storage';

export class ThrottleSetupModule {
  public static forRoot(): DynamicModule {
    return {
      module: ThrottleSetupModule,
      providers: [
        {
          provide: getOptionsToken(),
          inject: [ConfigService, Reflector],
          useFactory: (config: ConfigService, reflector: Reflector): ThrottlerModuleOptions =>
            ThrottleSetupModule.options(config, reflector),
        },
        { provide: getStorageToken(), useClass: ThrottleRedisStorage },
        { provide: APP_GUARD, useClass: ThrottleGuard },
        ThrottleTrustProxySetup,
      ],
    };
  }

  private static options(config: ConfigService, reflector: Reflector): ThrottlerModuleOptions {
    const isOutsideAuth = (context: ExecutionContext): boolean => {
      const targets = [context.getHandler(), context.getClass()];
      const isAuth = reflector.getAllAndOverride<Maybe<boolean>>(
        ThrottleMetadataKeyEnum.AUTH,
        targets,
      );

      return isAuth !== true;
    };

    const ttl = config.getOrThrow<number>('THROTTLE_TTL_MS');
    const limit = config.getOrThrow<number>('THROTTLE_LIMIT');
    const authTtl = config.getOrThrow<number>('THROTTLE_AUTH_TTL_MS');
    const authLimit = config.getOrThrow<number>('THROTTLE_AUTH_LIMIT');

    return {
      throttlers: [
        { name: 'default', ttl, limit },
        { name: 'auth', ttl: authTtl, limit: authLimit, skipIf: isOutsideAuth },
      ],
    };
  }
}
