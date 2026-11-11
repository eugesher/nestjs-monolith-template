import type { Maybe } from '@acme-libs/toolkit';

import type { ProductStatusArchiveOutcomeEnum } from '../../enums/product-status-archive-outcome.enum';

export interface IProductStatusArchiveView {
  outcome: ProductStatusArchiveOutcomeEnum;
  currentVersion: Maybe<number>;
}
