export interface IIdempotencyCoreClaimCommand {
  scope: string;
  key: string;
  body: object;
}
