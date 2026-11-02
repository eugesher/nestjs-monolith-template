import { JwtService } from '@nestjs/jwt';

import { CredentialsLibAccessTokenAdapter } from '../credentials-lib-access-token.adapter';

describe('CredentialsLibAccessTokenAdapter', () => {
  describe('sign', () => {
    it('signs the subject alone, even when the caller passes more', async () => {
      const jwt = new JwtService({ secret: 'access-secret-of-at-least-thirty-two-chars' });
      const adapter = new CredentialsLibAccessTokenAdapter(jwt);
      const payload = { sub: 'user-1', roles: ['admin'] };

      const token = await adapter.sign(payload);

      const claims = await jwt.verifyAsync<Record<string, unknown>>(token);

      expect(claims).toEqual({ sub: 'user-1', iat: expect.any(Number) as number });
    });
  });
});
