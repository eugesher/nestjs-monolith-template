export interface IRoleTransactionPort {
  run<T>(work: () => Promise<T>): Promise<T>;
}

export const ROLE_TRANSACTION_PORT = Symbol('ROLE_TRANSACTION_PORT');
