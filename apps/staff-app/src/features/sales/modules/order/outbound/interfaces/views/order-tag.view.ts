import type { OrderTagReplaceOutcomeEnum } from '../../enums/order-tag-replace-outcome.enum';

export interface IOrderTagFindView {
  id: string;
  name: string;
}

export interface IOrderTagReplaceView {
  outcome: OrderTagReplaceOutcomeEnum;
  tags: IOrderTagFindView[];
  missingTagIds: string[];
}
