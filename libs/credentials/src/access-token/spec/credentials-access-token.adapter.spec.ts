import { JwtService } from '@nestjs/jwt';

import { CredentialsAccessTokenAdapter } from '../credentials-access-token.adapter';

describe('CredentialsAccessTokenAdapter', () => {
  describe('sign', () => {
    it('signs the subject alone, even when the caller passes more', async () => {
      const jwt = new JwtService({ secret: 'access-secret-of-at-least-thirty-two-chars' });
      const adapter = new CredentialsAccessTokenAdapter(jwt);
      const payload = { sub: 'user-1', roles: ['admin'] };

      const token = await adapter.sign(payload);

      const claims = await jwt.verifyAsync<Record<string, unknown>>(token);

      expect(claims).toEqual({ sub: 'user-1', iat: expect.any(Number) as number });
    });
  });
});
