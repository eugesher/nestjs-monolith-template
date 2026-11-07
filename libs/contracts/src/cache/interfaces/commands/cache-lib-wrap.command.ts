export interface ICacheLibWrapCommand<T> {
  key: string;
  ttlMs: number;
  compute: () => Promise<T>;
}
