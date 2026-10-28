import { JwtModule } from '@nestjs/jwt';

import { IdentityCoreAccessTokenModule } from '../identity-core-access-token.module';

describe('IdentityCoreAccessTokenModule', () => {
  describe('register', () => {
    it('registers the JWT module without defaults, the adapter passes a secret per call', () => {
      const module = IdentityCoreAccessTokenModule.register();

      expect(module.module).toBe(JwtModule);
      expect(module.providers).toEqual(
        expect.arrayContaining([expect.objectContaining({ useValue: {} })]),
      );
    });
  });
});
