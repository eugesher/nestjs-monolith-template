import { Controller, Get, Global, INestApplication, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import {
  AUTH_CLAIMS_PORT,
  AUTH_USER_VALIDATOR_PORT,
  type IAuthCurrentUserView,
} from '@acme-libs/contracts/auth';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { RequiresPermission } from '../../decorators/auth-requires-permission.decorator';
import { Roles } from '../../decorators/auth-roles.decorator';
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

      @RequiresPermission(PermissionCodeEnum.NOTE_WRITE, PermissionCodeEnum.NOTE_READ)
      @Get('note')
      public note(): string {
        return 'note';
      }

      @Roles(RoleEnum.ADMIN)
      @Get('admin')
      public admin(): string {
        return 'admin';
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
                bob: { id: 'bob', email: 'bob@example.com' },
              };

              return Promise.resolve(users[query.sub]);
            },
          },
        },
        {
          provide: AUTH_CLAIMS_PORT,
          useValue: {
            findRoles: (query: { userId: string }) => {
              const roles: Record<string, RoleEnum[]> = {
                ann: [RoleEnum.ADMIN],
                bob: [RoleEnum.VIEWER],
              };

              return Promise.resolve(roles[query.userId]);
            },
            findPermissionCodes: (query: { userId: string }) => {
              const permissions: Record<string, PermissionCodeEnum[]> = {
                ann: [PermissionCodeEnum.NOTE_READ],
                bob: [PermissionCodeEnum.LEDGER_READ],
              };

              return Promise.resolve(permissions[query.userId]);
            },
          },
        },
      ],
      exports: [AUTH_USER_VALIDATOR_PORT, AUTH_CLAIMS_PORT],
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

  it('answers 401 without a token on a gated route, the JWT guard runs before the claim guards', async () => {
    const statuses = [];

    for (const route of ['note', 'admin']) {
      const response = await fetch(`${url}/${route}`);

      statuses.push(response.status);
    }

    expect(statuses).toEqual([401, 401]);
  });

  it('admits a user holding a required permission and a required role', async () => {
    const token = await new JwtService({
      secret: 'access-secret-of-at-least-thirty-two-chars',
    }).signAsync({ sub: 'ann' });
    const statuses = [];

    for (const route of ['note', 'admin']) {
      const response = await fetch(`${url}/${route}`, {
        headers: { authorization: `Bearer ${token}` },
      });

      statuses.push(response.status);
    }

    expect(statuses).toEqual([200, 200]);
  });

  it('answers 403 to a user without the permission or the role', async () => {
    const token = await new JwtService({
      secret: 'access-secret-of-at-least-thirty-two-chars',
    }).signAsync({ sub: 'bob' });
    const statuses = [];

    for (const route of ['note', 'admin']) {
      const response = await fetch(`${url}/${route}`, {
        headers: { authorization: `Bearer ${token}` },
      });

      statuses.push(response.status);
    }

    expect(statuses).toEqual([403, 403]);
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
