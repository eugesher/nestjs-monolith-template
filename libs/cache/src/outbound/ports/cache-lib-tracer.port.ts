import type { ICacheLibTracerSpanCommand } from '../interfaces';

export interface ICacheLibTracerPort {
  span<T>(command: ICacheLibTracerSpanCommand<T>): Promise<T>;
}

export const CACHE_LIB_TRACER_PORT = Symbol('CACHE_LIB_TRACER_PORT');
