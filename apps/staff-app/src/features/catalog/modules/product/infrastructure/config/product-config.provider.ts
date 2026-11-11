import { ConfigValueProvider } from '@acme-libs/config';

import { PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN } from '../../outbound';

export const ProductConfigOccRetryAttemptsProvider = ConfigValueProvider.provide({
  injectionToken: PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'OCC_RETRY_ATTEMPTS',
});
