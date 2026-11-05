import { TagCommonSubjectTypeEnum } from '../../enums/tag-common-subject-type.enum';

export interface ITagCommonFindSubjectIdsCommand {
  subjectType: TagCommonSubjectTypeEnum;
  tagId: string;
}
