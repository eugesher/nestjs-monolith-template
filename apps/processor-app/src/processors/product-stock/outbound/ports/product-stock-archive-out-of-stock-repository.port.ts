export interface IProductStockArchiveOutOfStockRepositoryPort {
  findActive(productIds: string[]): Promise<string[]>;
}

export const PRODUCT_STOCK_ARCHIVE_OUT_OF_STOCK_REPOSITORY_PORT = Symbol(
  'PRODUCT_STOCK_ARCHIVE_OUT_OF_STOCK_REPOSITORY_PORT',
);
