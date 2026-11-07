export interface ICacheLibSetCommand<T> {
  key: string;
  value: T;
  ttlMs: number;
}
