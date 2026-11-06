import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';

import { CREDENTIALS_LIB_PORT } from '@acme-libs/contracts/credentials';

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

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
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
})
export class CredentialsLibModule {}
