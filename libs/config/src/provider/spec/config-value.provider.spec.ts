import { ConfigService } from '@nestjs/config';

import { ConfigValueProvider } from '../config-value.provider';

describe('ConfigValueProvider', () => {
  describe('provide', () => {
    it('provides the token from ConfigService', () => {
      const token = Symbol('ITEM_OCC_RETRY_ATTEMPTS');

      const provider = ConfigValueProvider.provide({
        provide: token,
        property: 'OCC_RETRY_ATTEMPTS',
      });

      expect(provider).toMatchObject({ provide: token, inject: [ConfigService] });
    });

    it('reads the value of the property and fails when it is missing', () => {
      const config = { getOrThrow: jest.fn().mockReturnValue(5) };
      const provider = ConfigValueProvider.provide({
        provide: Symbol('ITEM_OCC_RETRY_ATTEMPTS'),
        property: 'OCC_RETRY_ATTEMPTS',
      });

      const value = provider.useFactory(config);

      expect(value).toBe(5);
      expect(config.getOrThrow).toHaveBeenCalledWith('OCC_RETRY_ATTEMPTS');
    });
  });
});
