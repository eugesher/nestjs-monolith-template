import { Maybe } from '@acme-libs/toolkit';

import { ProductStatusArchiveOutcomeEnum } from '../../enums/product-status-archive-outcome.enum';

export interface IProductStatusArchiveView {
  outcome: ProductStatusArchiveOutcomeEnum;
  currentVersion: Maybe<number>;
}
