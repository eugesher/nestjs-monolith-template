import { ConfigValueProvider } from '@acme-libs/config';

import { CATALOG_CACHE_TTL_MS_DEFAULT_TOKEN } from '../../outbound';

export const CatalogConfigCacheTtlMsDefaultProvider = ConfigValueProvider.provide({
  injectionToken: CATALOG_CACHE_TTL_MS_DEFAULT_TOKEN,
  configProperty: 'CACHE_TTL_MS_DEFAULT',
});
