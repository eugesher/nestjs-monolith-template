export interface IProductTransactionPort {
  run<T>(work: () => Promise<T>): Promise<T>;
}

export const PRODUCT_TRANSACTION_PORT = Symbol('PRODUCT_TRANSACTION_PORT');
