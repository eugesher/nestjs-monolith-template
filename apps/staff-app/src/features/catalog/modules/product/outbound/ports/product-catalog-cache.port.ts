export interface IProductCatalogCachePort {
  invalidate(): Promise<void>;
}

export const PRODUCT_CATALOG_CACHE_PORT = Symbol('PRODUCT_CATALOG_CACHE_PORT');
