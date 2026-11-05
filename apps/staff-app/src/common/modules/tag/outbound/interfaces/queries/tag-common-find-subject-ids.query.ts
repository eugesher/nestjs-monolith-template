import { SubjectTag } from '@acme-staff/common/entities';

export type ITagCommonFindSubjectIdsQuery = Pick<SubjectTag, 'subjectType' | 'tagId'>;
