import { Maybe } from '@acme-libs/toolkit';

import { ICacheLibSetCommand, ICacheLibWrapCommand } from '../interfaces';

export interface ICacheLibPort {
  handleGet<T>(key: string): Promise<Maybe<T>>;
  handleSet<T>(command: ICacheLibSetCommand<T>): Promise<void>;
  handleDel(key: string): Promise<void>;
  handleDelByPrefix(prefix: string): Promise<number>;
  handleWrap<T>(command: ICacheLibWrapCommand<T>): Promise<T>;
}

export const CACHE_LIB_PORT = Symbol('CACHE_LIB_PORT');
