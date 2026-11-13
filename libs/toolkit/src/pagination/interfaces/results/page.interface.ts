export interface IPage<T> {
  page: number;
  count: number;
  pageCount: number;
  total: number;
  data: T[];
}
