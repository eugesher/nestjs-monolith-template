export interface IProductCoreCatalogCachePort {
  invalidate(): Promise<void>;
}

export const PRODUCT_CORE_CATALOG_CACHE_PORT = Symbol('PRODUCT_CORE_CATALOG_CACHE_PORT');
