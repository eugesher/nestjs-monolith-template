import type { Maybe } from '@acme-libs/toolkit';

import type { ICacheLibStoreSetCommand } from '../interfaces';

export interface ICacheLibStorePort {
  get<T>(key: string): Promise<Maybe<T>>;
  set<T>(command: ICacheLibStoreSetCommand<T>): Promise<void>;
  del(key: string): Promise<void>;
  unlinkByPrefix(prefix: string): Promise<number>;
}

export const CACHE_LIB_STORE_PORT = Symbol('CACHE_LIB_STORE_PORT');
