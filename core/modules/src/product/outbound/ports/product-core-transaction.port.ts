export interface IProductCoreTransactionPort {
  run<T>(work: () => Promise<T>): Promise<T>;
  afterCommit(hook: () => Promise<void>): void;
}

export const PRODUCT_CORE_TRANSACTION_PORT = Symbol('PRODUCT_CORE_TRANSACTION_PORT');
