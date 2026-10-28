import { ILoadOwnedOptions } from './load-owned-options.interface';

export class OwnershipHelper {
  public static async loadOwned<TEntity extends object>(
    options: ILoadOwnedOptions<TEntity>,
  ): Promise<TEntity> {
    const { find, owner, requiredOwner, onMissing, onForbidden } = options;
    const entity = await find();

    if (entity === null) {
      onMissing();

      throw new Error('OwnershipHelper.loadOwned: onMissing must throw');
    }

    if (requiredOwner === undefined) {
      return entity;
    }

    const actualOwner = owner(entity);

    if (actualOwner !== requiredOwner) {
      onForbidden(actualOwner);

      throw new Error('OwnershipHelper.loadOwned: onForbidden must throw');
    }

    return entity;
  }
}
