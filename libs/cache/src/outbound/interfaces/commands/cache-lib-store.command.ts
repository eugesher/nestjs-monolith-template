export interface ICacheLibStoreSetCommand<T> {
  key: string;
  value: T;
  ttlMs: number;
}
