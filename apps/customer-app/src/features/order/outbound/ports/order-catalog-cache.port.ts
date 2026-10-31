export interface IOrderCatalogCachePort {
  invalidate(): Promise<void>;
}

export const ORDER_CATALOG_CACHE_PORT = Symbol('ORDER_CATALOG_CACHE_PORT');
