import type { Maybe } from '@acme-libs/toolkit';

import type { ProductCoreArchiveOutcomeEnum } from '../../enums/product-core-archive-outcome.enum';

export interface IProductCoreArchiveView {
  outcome: ProductCoreArchiveOutcomeEnum;
  currentVersion: Maybe<number>;
}
