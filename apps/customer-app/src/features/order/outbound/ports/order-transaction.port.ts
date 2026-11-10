export interface IOrderTransactionPort {
  run<T>(work: () => Promise<T>): Promise<T>;
}

export const ORDER_TRANSACTION_PORT = Symbol('ORDER_TRANSACTION_PORT');
