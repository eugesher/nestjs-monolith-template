import { ConfigService } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ThrottlerModule, type ThrottlerModuleOptions } from '@nestjs/throttler';
import type { DynamicModule, ExecutionContext } from '@nestjs/common';

import type { Maybe } from '@acme-libs/toolkit';

import { ThrottleMetadataKeyEnum } from './enums/throttle-metadata-key.enum';
import { ThrottleGuard } from './guards/throttle.guard';
import { ThrottleTrustProxySetup } from './proxy/throttle-trust-proxy.setup';
import { ThrottleRedisStorage } from './storage/throttle-redis.storage';
import { ThrottleStorageModule } from './storage/throttle-storage.module';

export class ThrottlerSetupModule {
  public static forRoot(): DynamicModule {
    return {
      module: ThrottlerSetupModule,
      imports: [
        ThrottlerModule.forRootAsync({
          imports: [ThrottleStorageModule],
          inject: [ConfigService, Reflector, ThrottleRedisStorage],
          useFactory: (
            config: ConfigService,
            reflector: Reflector,
            storage: ThrottleRedisStorage,
          ): ThrottlerModuleOptions => ThrottlerSetupModule.options(config, reflector, storage),
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: ThrottleGuard }, ThrottleTrustProxySetup],
    };
  }

  private static options(
    config: ConfigService,
    reflector: Reflector,
    storage: ThrottleRedisStorage,
  ): ThrottlerModuleOptions {
    const isOutsideAuth = (context: ExecutionContext): boolean => {
      const metadataTargets = [context.getHandler(), context.getClass()];
      const isAuth = reflector.getAllAndOverride<Maybe<boolean>>(
        ThrottleMetadataKeyEnum.AUTH,
        metadataTargets,
      );

      return isAuth !== true;
    };

    const ttl = config.getOrThrow<number>('THROTTLE_TTL_MS');
    const limit = config.getOrThrow<number>('THROTTLE_LIMIT');
    const authTtl = config.getOrThrow<number>('THROTTLE_AUTH_TTL_MS');
    const authLimit = config.getOrThrow<number>('THROTTLE_AUTH_LIMIT');

    return {
      storage,
      throttlers: [
        { name: 'default', ttl, limit },
        { name: 'auth', ttl: authTtl, limit: authLimit, skipIf: isOutsideAuth },
      ],
    };
  }
}
