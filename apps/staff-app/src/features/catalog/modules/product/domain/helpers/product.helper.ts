import { Maybe } from '@acme-libs/toolkit';
import { ProductErrorCodeEnum } from '../enums/product-error-code.enum';
import { ProductDomainException } from '../exceptions/product-domain.exception';
import { ProductModel } from '../models/product.model';

export class ProductHelper {
  public static assertExpectedVersion(product: ProductModel, expectedVersion: Maybe<number>): void {
    if (expectedVersion === undefined || expectedVersion === product.version) {
      return;
    }

    throw new ProductDomainException(
      ProductErrorCodeEnum.PRODUCT_VERSION_MISMATCH,
      `Product ${String(product.id)}: If-Match version ${expectedVersion} does not match the current version ${product.version}`,
      { currentVersion: product.version },
    );
  }
}
