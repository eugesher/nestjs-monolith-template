import type { SubjectTag } from '@acme-staff/common/entities';

export type ITagCommonFindQuery = Pick<SubjectTag, 'subjectType' | 'subjectId'>;
