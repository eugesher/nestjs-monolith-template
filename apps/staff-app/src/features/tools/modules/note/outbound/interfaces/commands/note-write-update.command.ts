export interface INoteWriteUpdateCommand {
  id: string;
  versionAsRead: number;
  body: string;
  resolved: boolean;
  version: number;
}
