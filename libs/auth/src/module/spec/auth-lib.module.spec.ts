import { Controller, Get, Global, INestApplication, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { AUTH_USER_VALIDATOR_PORT, type IAuthCurrentUserView } from '@acme-libs/contracts/auth';
import type { Maybe } from '@acme-libs/toolkit';
import { CurrentUser } from '../../decorators/auth-current-user.decorator';
import { Public } from '../../decorators/auth-public.decorator';
import { AuthLibModule } from '../auth-lib.module';

describe('AuthLibModule', () => {
  let app: INestApplication;
  let url: string;

  beforeEach(async () => {
    @Controller()
    class ProbeController {
      @Public()
      @Get('open')
      public open(): string {
        return 'open';
      }

      @Get('me')
      public me(@CurrentUser() user: Maybe<IAuthCurrentUserView>): Maybe<IAuthCurrentUserView> {
        return user;
      }
    }

    @Global()
    @Module({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET: 'access-secret-of-at-least-thirty-two-chars' })],
        }),
      ],
      providers: [
        {
          provide: AUTH_USER_VALIDATOR_PORT,
          useValue: {
            validate: (query: { sub: string }) => {
              const users: Record<string, IAuthCurrentUserView> = {
                ann: { id: 'ann', email: 'ann@example.com' },
              };

              return Promise.resolve(users[query.sub]);
            },
          },
        },
      ],
      exports: [AUTH_USER_VALIDATOR_PORT],
    })
    class ValidatorModule {}

    @Module({ imports: [ValidatorModule, AuthLibModule], controllers: [ProbeController] })
    class TestModule {}

    app = await NestFactory.create(TestModule, { logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  it('opens a public route without a token', async () => {
    const response = await fetch(`${url}/open`);

    expect(response.status).toBe(200);
  });

  it('closes every other route without a token with 401', async () => {
    const response = await fetch(`${url}/me`);

    expect(response.status).toBe(401);
  });

  it('answers 401 for a token signed with another secret', async () => {
    const token = await new JwtService({
      secret: 'another-secret-of-at-least-thirty-two',
    }).signAsync({ sub: 'ann' });

    const response = await fetch(`${url}/me`, { headers: { authorization: `Bearer ${token}` } });

    expect(response.status).toBe(401);
  });

  it('answers 401 for a valid token of a user the validator does not know', async () => {
    const token = await new JwtService({
      secret: 'access-secret-of-at-least-thirty-two-chars',
    }).signAsync({ sub: 'eve' });

    const response = await fetch(`${url}/me`, { headers: { authorization: `Bearer ${token}` } });

    expect(response.status).toBe(401);
  });

  it('hands the re-derived user to @CurrentUser()', async () => {
    const token = await new JwtService({
      secret: 'access-secret-of-at-least-thirty-two-chars',
    }).signAsync({ sub: 'ann', email: 'forged@example.com' });

    const response = await fetch(`${url}/me`, { headers: { authorization: `Bearer ${token}` } });
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 'ann', email: 'ann@example.com' });
  });
});
