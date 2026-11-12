import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import type { DynamicModule } from '@nestjs/common';

import { CREDENTIALS_LIB_PORT } from '@acme-libs/contracts/credentials';
import type { AuthAudienceEnum } from '@acme-libs/kernel';

import {
  CredentialsLibHashPasswordUseCase,
  CredentialsLibSignAccessTokenUseCase,
  CredentialsLibVerifyPasswordUseCase,
} from '../application';
import {
  CredentialsLibAccessTokenAdapter,
  CredentialsLibPasswordHasherAdapter,
} from '../infrastructure';
import { CredentialsLibFacade } from './credentials-lib.facade';

export class CredentialsLibModule {
  public static register(audience: AuthAudienceEnum): DynamicModule {
    return {
      module: CredentialsLibModule,
      imports: [
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.getOrThrow<string>('JWT_SECRET'),
            signOptions: {
              algorithm: 'HS256',
              audience,
              expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN') as JwtSignOptions['expiresIn'],
            },
          }),
        }),
      ],
      exports: [CREDENTIALS_LIB_PORT],
      providers: [
        { provide: CREDENTIALS_LIB_PORT, useClass: CredentialsLibFacade },
        CredentialsLibSignAccessTokenUseCase,
        CredentialsLibHashPasswordUseCase,
        CredentialsLibVerifyPasswordUseCase,
        CredentialsLibAccessTokenAdapter.provider,
        CredentialsLibPasswordHasherAdapter.provider,
      ],
    };
  }
}
