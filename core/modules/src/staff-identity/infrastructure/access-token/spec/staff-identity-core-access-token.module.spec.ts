import { JwtModule } from '@nestjs/jwt';

import { StaffIdentityCoreAccessTokenModule } from '../staff-identity-core-access-token.module';

describe('StaffIdentityCoreAccessTokenModule', () => {
  describe('register', () => {
    it('registers the JWT module without defaults, the adapter passes a secret per call', () => {
      const module = StaffIdentityCoreAccessTokenModule.register();

      expect(module.module).toBe(JwtModule);
      expect(module.providers).toEqual(
        expect.arrayContaining([expect.objectContaining({ useValue: {} })]),
      );
    });
  });
});
