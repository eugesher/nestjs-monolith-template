import type { ProductTagReplaceOutcomeEnum } from '../../enums/product-tag-replace-outcome.enum';

export interface IProductTagFindView {
  id: string;
  name: string;
}

export interface IProductTagReplaceView {
  outcome: ProductTagReplaceOutcomeEnum;
  tags: IProductTagFindView[];
  missingTagIds: string[];
}
