import { IProductStockArchiveCommand, IProductStockArchiveView } from '../interfaces';

export interface IProductStockArchivePort {
  archive(command: IProductStockArchiveCommand): Promise<IProductStockArchiveView>;
}

export const PRODUCT_STOCK_ARCHIVE_PORT = Symbol('PRODUCT_STOCK_ARCHIVE_PORT');
