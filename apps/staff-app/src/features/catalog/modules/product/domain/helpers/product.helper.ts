import type { Maybe } from '@acme-libs/toolkit';

import { ProductVersionMismatchException } from '../exceptions/product-version-mismatch.exception';
import type { ProductModel } from '../models/product.model';

export class ProductHelper {
  public static assertExpectedVersion(product: ProductModel, expectedVersion: Maybe<number>): void {
    if (expectedVersion === undefined || expectedVersion === product.version) {
      return;
    }

    throw new ProductVersionMismatchException(
      product.id,
      product.version,
      `Product ${product.id}: If-Match version ${expectedVersion} does not match the current version ${product.version}`,
    );
  }
}
