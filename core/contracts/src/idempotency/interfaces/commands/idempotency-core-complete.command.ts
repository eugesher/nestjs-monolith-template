export interface IIdempotencyCoreCompleteCommand {
  scope: string;
  key: string;
  response: object;
}
