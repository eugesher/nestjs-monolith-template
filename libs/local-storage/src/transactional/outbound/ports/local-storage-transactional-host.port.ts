export interface ILocalStorageTransactionalHostPort {
  isActive(): boolean;
  withTransaction<T>(work: () => Promise<T>): Promise<T>;
}

export const LOCAL_STORAGE_TRANSACTIONAL_HOST_PORT = Symbol(
  'LOCAL_STORAGE_TRANSACTIONAL_HOST_PORT',
);
