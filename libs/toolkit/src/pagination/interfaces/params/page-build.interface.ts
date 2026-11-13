export interface IPageBuild<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
