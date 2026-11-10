export interface INoteTransactionPort {
  run<T>(work: () => Promise<T>): Promise<T>;
}

export const NOTE_TRANSACTION_PORT = Symbol('NOTE_TRANSACTION_PORT');
