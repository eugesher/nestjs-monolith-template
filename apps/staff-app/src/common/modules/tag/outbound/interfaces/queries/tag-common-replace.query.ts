import type { SubjectTag } from '@acme-staff/common/entities';

export type ITagCommonReplaceFindLinkedQuery = Pick<SubjectTag, 'subjectType' | 'subjectId'>;

export type ITagCommonReplaceLinkQuery = Pick<SubjectTag, 'subjectType' | 'subjectId'> & {
  tagIds: string[];
};

export type ITagCommonReplaceUnlinkQuery = Pick<SubjectTag, 'subjectType' | 'subjectId'> & {
  tagIds: string[];
};
