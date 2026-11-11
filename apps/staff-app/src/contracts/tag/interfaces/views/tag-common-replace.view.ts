import type { TagCommonReplaceOutcomeEnum } from '../../enums/tag-common-replace-outcome.enum';
import type { ITagCommonTagView } from './tag-common-tag.view';

export interface ITagCommonReplaceView {
  outcome: TagCommonReplaceOutcomeEnum;
  tags: ITagCommonTagView[];
  missingTagIds: string[];
}
