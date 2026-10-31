export class ProductWriteConflictError extends Error {
  constructor(
    public readonly productId: string,
    public readonly currentVersion: number,
  ) {
    super(`Optimistic write conflict on product ${productId} (current version ${currentVersion})`);
    this.name = 'ProductWriteConflictError';
  }
}
