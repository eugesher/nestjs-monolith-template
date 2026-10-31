export interface ITransactionPort {
  run<T>(work: () => Promise<T>): Promise<T>;
  afterCommit(hook: () => Promise<void>): void;
}

export const TRANSACTION_PORT = Symbol('TRANSACTION_PORT');
