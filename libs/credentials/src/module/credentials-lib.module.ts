import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';

import {
  CREDENTIALS_ACCESS_TOKEN_PORT,
  CREDENTIALS_PASSWORD_HASHER_PORT,
} from '@acme-libs/contracts/credentials';
import { CredentialsAccessTokenAdapter } from '../access-token/credentials-access-token.adapter';
import { CredentialsPasswordHasherAdapter } from '../password-hasher/credentials-password-hasher.adapter';

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
  exports: [CREDENTIALS_ACCESS_TOKEN_PORT, CREDENTIALS_PASSWORD_HASHER_PORT],
  providers: [
    { provide: CREDENTIALS_ACCESS_TOKEN_PORT, useClass: CredentialsAccessTokenAdapter },
    { provide: CREDENTIALS_PASSWORD_HASHER_PORT, useClass: CredentialsPasswordHasherAdapter },
  ],
})
export class CredentialsLibModule {}
