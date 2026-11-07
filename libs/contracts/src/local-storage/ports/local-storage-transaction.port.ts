export interface ILocalStorageTransaction {
  run<T>(work: () => Promise<T>): Promise<T>;
  afterCommit(hook: () => Promise<void>): void;
}

export const LOCAL_STORAGE_TRANSACTION = Symbol('LOCAL_STORAGE_TRANSACTION');
