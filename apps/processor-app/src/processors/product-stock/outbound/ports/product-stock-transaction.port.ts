export interface IProductStockTransactionPort {
  run<T>(work: () => Promise<T>): Promise<T>;
}

export const PRODUCT_STOCK_TRANSACTION_PORT = Symbol('PRODUCT_STOCK_TRANSACTION_PORT');
