export interface ILocalStorageTransactionHostPort {
  isActive(): boolean;
  withTransaction<T>(work: () => Promise<T>): Promise<T>;
}

export const LOCAL_STORAGE_TRANSACTION_HOST_PORT = Symbol('LOCAL_STORAGE_TRANSACTION_HOST_PORT');
