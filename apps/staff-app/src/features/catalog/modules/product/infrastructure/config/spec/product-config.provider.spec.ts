import { PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN } from '../../../outbound';
import { ProductConfigOccRetryAttemptsProvider } from '../product-config.provider';

describe('product config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('ProductConfigOccRetryAttemptsProvider', () => {
    it('provides OCC_RETRY_ATTEMPTS under the product token', () => {
      const value = ProductConfigOccRetryAttemptsProvider.useFactory({ getOrThrow });

      expect(ProductConfigOccRetryAttemptsProvider.provide).toBe(PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN);
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('OCC_RETRY_ATTEMPTS');
    });
  });
});
