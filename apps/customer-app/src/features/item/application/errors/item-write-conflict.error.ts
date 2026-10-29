export class ItemWriteConflictError extends Error {
  constructor(
    public readonly itemId: string,
    public readonly currentVersion: number,
  ) {
    super(`Optimistic write conflict on item ${itemId} (current version ${currentVersion})`);
    this.name = 'ItemWriteConflictError';
  }
}
