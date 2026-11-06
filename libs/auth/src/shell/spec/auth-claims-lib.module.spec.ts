import { Controller, Get, Global, INestApplication, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { AUTH_USER_VALIDATOR_PORT, IAuthCurrentUserView } from '@acme-libs/contracts/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';

import { RequiresPermission } from '../../decorators/auth-requires-permission.decorator';
import { AuthClaimsLibModule } from '../auth-claims-lib.module';
import { AuthLibModule } from '../auth-lib.module';

describe('AuthClaimsLibModule', () => {
  let app: INestApplication;
  let url: string;

  beforeEach(async () => {
    @Controller()
    class ProbeController {
      @Get('plain')
      public plain(): string {
        return 'plain';
      }

      @RequiresPermission(PermissionCodeEnum.PRODUCT_WRITE, PermissionCodeEnum.PRODUCT_READ)
      @Get('note')
      public note(): string {
        return 'note';
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
            handleValidate: (query: { sub: string }) => {
              const users: Record<string, IAuthCurrentUserView> = {
                ann: {
                  id: 'ann',
                  email: 'ann@example.com',
                  permissionCodes: [PermissionCodeEnum.PRODUCT_READ],
                },
                bob: {
                  id: 'bob',
                  email: 'bob@example.com',
                  permissionCodes: [PermissionCodeEnum.LEDGER_READ],
                },
              };

              return Promise.resolve(users[query.sub]);
            },
          },
        },
      ],
      exports: [AUTH_USER_VALIDATOR_PORT],
    })
    class ValidatorModule {}

    @Module({
      imports: [ValidatorModule, AuthLibModule, AuthClaimsLibModule],
      controllers: [ProbeController],
    })
    class TestModule {}

    app = await NestFactory.create(TestModule, { logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  it('answers 401 without a token on a gated route, the JWT guard runs before the permissions guard', async () => {
    const response = await fetch(`${url}/note`);

    expect(response.status).toBe(401);
  });

  it('admits a user holding a required permission', async () => {
    const token = await new JwtService({
      secret: 'access-secret-of-at-least-thirty-two-chars',
    }).signAsync({ sub: 'ann' });

    const response = await fetch(`${url}/note`, {
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
  });

  it('answers 403 to a user without the permission', async () => {
    const token = await new JwtService({
      secret: 'access-secret-of-at-least-thirty-two-chars',
    }).signAsync({ sub: 'bob' });

    const response = await fetch(`${url}/note`, {
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(403);
  });

  it('lets a route without claim decorators through for any authenticated user', async () => {
    const token = await new JwtService({
      secret: 'access-secret-of-at-least-thirty-two-chars',
    }).signAsync({ sub: 'bob' });

    const response = await fetch(`${url}/plain`, {
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
  });
});
