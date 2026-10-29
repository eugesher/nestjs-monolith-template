import { Maybe } from '@acme-libs/toolkit';
import { ItemErrorCodeEnum } from '../enums/item-error-code.enum';
import { ItemDomainException } from '../exceptions/item-domain.exception';
import { ItemModel } from '../models/item.model';

export class ItemHelper {
  public static assertExpectedVersion(item: ItemModel, expectedVersion: Maybe<number>): void {
    if (expectedVersion === undefined || expectedVersion === item.version) {
      return;
    }

    throw new ItemDomainException(
      ItemErrorCodeEnum.ITEM_VERSION_MISMATCH,
      `Item ${String(item.id)}: If-Match version ${expectedVersion} does not match the current version ${item.version}`,
      { currentVersion: item.version },
    );
  }
}
