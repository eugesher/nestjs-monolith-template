import { CATALOG_CACHE_TTL_MS_DEFAULT_TOKEN } from '../../../outbound';
import { CatalogConfigCacheTtlMsDefaultProvider } from '../catalog-config.provider';

describe('catalog config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('CatalogConfigCacheTtlMsDefaultProvider', () => {
    it('provides CACHE_TTL_MS_DEFAULT under the catalog token', () => {
      const value = CatalogConfigCacheTtlMsDefaultProvider.useFactory({ getOrThrow });

      expect(CatalogConfigCacheTtlMsDefaultProvider.provide).toBe(
        CATALOG_CACHE_TTL_MS_DEFAULT_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('CACHE_TTL_MS_DEFAULT');
    });
  });
});
