export interface IProductStockCoreTransactionPort {
  run<T>(work: () => Promise<T>): Promise<T>;
  afterCommit(hook: () => Promise<void>): void;
}

export const PRODUCT_STOCK_CORE_TRANSACTION_PORT = Symbol('PRODUCT_STOCK_CORE_TRANSACTION_PORT');
