import { Maybe } from '@acme-libs/toolkit';

export interface ICachePort {
  get<T>(key: string): Promise<Maybe<T>>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  del(key: string): Promise<void>;
  delByPrefix(prefix: string): Promise<number>;
  wrap<T>(key: string, ttlMs: number, compute: () => Promise<T>): Promise<T>;
}

export const CACHE_PORT = Symbol('CACHE_PORT');
