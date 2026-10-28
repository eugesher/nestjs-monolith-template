export interface ILoadOwnedOptions<TEntity> {
  find: () => Promise<TEntity | null>;
  owner: (entity: TEntity) => string | null;
  requiredOwner?: string | null;
  onMissing: () => never;
  onForbidden: (actualOwner: string | null) => never;
}
