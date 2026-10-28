export interface IItemCreateCommand {
  sku: string;
  name: string;
  ownerId: string;
  idempotencyKey: string;
}
