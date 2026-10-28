import { JwtService } from '@nestjs/jwt';

import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IdentityCoreAccessTokenAdapter } from '../identity-core-access-token.adapter';

describe('IdentityCoreAccessTokenAdapter', () => {
  let jwt: JwtService;
  let adapter: IdentityCoreAccessTokenAdapter;

  beforeEach(() => {
    jwt = new JwtService({});
    adapter = new IdentityCoreAccessTokenAdapter(
      '15m',
      'access-secret-of-at-least-thirty-two-chars',
      '7d',
      'refresh-secret-of-at-least-thirty-two-chars',
      jwt,
    );
  });

  describe('signAccess', () => {
    it('signs the claims with a unique jti and the access TTL under the access secret', async () => {
      const token = await adapter.signAccess({
        sub: 'user-1',
        email: 'editor@example.com',
        roles: [RoleEnum.EDITOR],
        permissions: [PermissionCodeEnum.ITEM_READ],
      });

      const payload = await jwt.verifyAsync<Record<string, unknown>>(token, {
        secret: 'access-secret-of-at-least-thirty-two-chars',
      });

      expect(payload).toEqual({
        sub: 'user-1',
        email: 'editor@example.com',
        roles: ['editor'],
        permissions: ['item:read'],
        jti: expect.stringMatching(/^[0-9a-f-]{36}$/) as string,
        iat: expect.any(Number) as number,
        exp: (payload.iat as number) + 900,
      });
    });

    it('gives two tokens of the same claims different ids', async () => {
      const claims = { sub: 'user-1', email: 'editor@example.com', roles: [], permissions: [] };

      const first = await adapter.signAccess(claims);
      const second = await adapter.signAccess(claims);

      expect(first).not.toBe(second);
    });
  });

  describe('signRefresh', () => {
    it('signs only the subject with the refresh TTL under the refresh secret', async () => {
      const token = await adapter.signRefresh('user-1');

      const payload = await jwt.verifyAsync<Record<string, unknown>>(token, {
        secret: 'refresh-secret-of-at-least-thirty-two-chars',
      });

      expect(payload).toEqual({
        sub: 'user-1',
        jti: expect.stringMatching(/^[0-9a-f-]{36}$/) as string,
        iat: expect.any(Number) as number,
        exp: (payload.iat as number) + 604800,
      });
    });
  });

  describe('verifyRefresh', () => {
    it('returns the subject of a refresh token', async () => {
      const token = await adapter.signRefresh('user-1');

      const userId = await adapter.verifyRefresh(token);

      expect(userId).toBe('user-1');
    });

    it('rejects an access token presented as a refresh token', async () => {
      const token = await adapter.signAccess({
        sub: 'user-1',
        email: 'editor@example.com',
        roles: [],
        permissions: [],
      });

      const userId = await adapter.verifyRefresh(token);

      expect(userId).toBeUndefined();
    });

    it('rejects an expired refresh token', async () => {
      const token = await jwt.signAsync(
        { sub: 'user-1', exp: Math.floor(Date.now() / 1000) - 1 },
        { secret: 'refresh-secret-of-at-least-thirty-two-chars' },
      );

      const userId = await adapter.verifyRefresh(token);

      expect(userId).toBeUndefined();
    });

    it('rejects garbage', async () => {
      const userId = await adapter.verifyRefresh('not-a-token');

      expect(userId).toBeUndefined();
    });
  });
});
