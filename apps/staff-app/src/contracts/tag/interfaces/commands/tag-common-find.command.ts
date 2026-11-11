import type { TagCommonSubjectTypeEnum } from '../../enums/tag-common-subject-type.enum';

export interface ITagCommonFindCommand {
  subjectType: TagCommonSubjectTypeEnum;
  subjectId: string;
}
