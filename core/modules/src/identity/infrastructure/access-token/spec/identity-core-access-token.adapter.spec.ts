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
      jwt,
    );
  });

  describe('sign', () => {
    it('signs the claims with a unique jti and the TTL under the secret', async () => {
      const token = await adapter.sign({
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

      const first = await adapter.sign(claims);
      const second = await adapter.sign(claims);

      expect(first).not.toBe(second);
    });
  });
});
