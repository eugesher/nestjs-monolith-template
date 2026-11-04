import { IProductStockProductFoundRecord } from '../interfaces';

export interface IProductStockArchiveOutOfStockRepositoryPort {
  findActive(productIds: string[]): Promise<IProductStockProductFoundRecord[]>;
}

export const PRODUCT_STOCK_ARCHIVE_OUT_OF_STOCK_REPOSITORY_PORT = Symbol(
  'PRODUCT_STOCK_ARCHIVE_OUT_OF_STOCK_REPOSITORY_PORT',
);
