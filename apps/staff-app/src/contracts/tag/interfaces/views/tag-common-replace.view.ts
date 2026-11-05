import { TagCommonReplaceOutcomeEnum } from '../../enums/tag-common-replace-outcome.enum';
import { ITagCommonTagView } from './tag-common-tag.view';

export interface ITagCommonReplaceView {
  outcome: TagCommonReplaceOutcomeEnum;
  tags: ITagCommonTagView[];
  missingTagIds: string[];
}
