export interface ITagCommonTransactionPort {
  run<T>(work: () => Promise<T>): Promise<T>;
}

export const TAG_COMMON_TRANSACTION_PORT = Symbol('TAG_COMMON_TRANSACTION_PORT');
