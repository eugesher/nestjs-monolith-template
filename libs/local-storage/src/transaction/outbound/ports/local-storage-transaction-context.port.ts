import { Maybe } from '@acme-libs/toolkit';

export interface ILocalStorageTransactionContextPort {
  run<T>(work: () => Promise<T>): Promise<T>;
  setHooks(hooks: (() => Promise<void>)[]): void;
  getHooks(): Maybe<(() => Promise<void>)[]>;
}

export const LOCAL_STORAGE_TRANSACTION_CONTEXT_PORT = Symbol(
  'LOCAL_STORAGE_TRANSACTION_CONTEXT_PORT',
);
