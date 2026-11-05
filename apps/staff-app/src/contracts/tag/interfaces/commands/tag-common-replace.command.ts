import { TagCommonSubjectTypeEnum } from '../../enums/tag-common-subject-type.enum';

export interface ITagCommonReplaceCommand {
  subjectType: TagCommonSubjectTypeEnum;
  subjectId: string;
  tagIds: string[];
}
