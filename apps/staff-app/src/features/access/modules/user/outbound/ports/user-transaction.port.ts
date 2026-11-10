export interface IUserTransactionPort {
  run<T>(work: () => Promise<T>): Promise<T>;
}

export const USER_TRANSACTION_PORT = Symbol('USER_TRANSACTION_PORT');
