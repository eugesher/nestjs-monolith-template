import { ConfigService } from '@nestjs/config';

import { ConfigProviderHelper } from '../config-provider.helper';

describe('ConfigProviderHelper', () => {
  describe('value', () => {
    it('provides the token from ConfigService', () => {
      const token = Symbol('ITEM_OCC_RETRY_ATTEMPTS');

      const provider = ConfigProviderHelper.value(token, 'OCC_RETRY_ATTEMPTS');

      expect(provider).toMatchObject({ provide: token, inject: [ConfigService] });
    });

    it('reads the value of the key and fails when it is missing', () => {
      const config = { getOrThrow: jest.fn().mockReturnValue(5) };
      const provider = ConfigProviderHelper.value(
        Symbol('ITEM_OCC_RETRY_ATTEMPTS'),
        'OCC_RETRY_ATTEMPTS',
      ) as {
        useFactory: (config: ConfigService) => unknown;
      };

      const value = provider.useFactory(config as unknown as ConfigService);

      expect(value).toBe(5);
      expect(config.getOrThrow).toHaveBeenCalledWith('OCC_RETRY_ATTEMPTS');
    });
  });
});
