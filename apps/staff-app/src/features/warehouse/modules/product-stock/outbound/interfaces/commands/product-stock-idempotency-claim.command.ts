export interface IProductStockIdempotencyClaimCommand {
  key: string;
  body: object;
}
