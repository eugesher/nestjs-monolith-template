export interface INoteWriteUpdateQuery {
  id: string;
  versionAsRead: number;
  body: string;
  resolved: boolean;
  version: number;
}
