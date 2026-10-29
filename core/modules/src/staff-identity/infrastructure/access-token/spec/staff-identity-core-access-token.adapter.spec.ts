import { JwtService } from '@nestjs/jwt';

import { StaffIdentityCoreAccessTokenAdapter } from '../staff-identity-core-access-token.adapter';

describe('StaffIdentityCoreAccessTokenAdapter', () => {
  let jwt: JwtService;
  let adapter: StaffIdentityCoreAccessTokenAdapter;

  beforeEach(() => {
    jwt = new JwtService({});
    adapter = new StaffIdentityCoreAccessTokenAdapter(
      '15m',
      'access-secret-of-at-least-thirty-two-chars',
      jwt,
    );
  });

  describe('sign', () => {
    it('signs exactly the subject, the issue time and the expiry under the secret', async () => {
      const token = await adapter.sign({ sub: 'user-1' });

      const payload = await jwt.verifyAsync<Record<string, unknown>>(token, {
        secret: 'access-secret-of-at-least-thirty-two-chars',
      });

      expect(payload).toEqual({
        sub: 'user-1',
        iat: expect.any(Number) as number,
        exp: (payload.iat as number) + 900,
      });
    });
  });
});
