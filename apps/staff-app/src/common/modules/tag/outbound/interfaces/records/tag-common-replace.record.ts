import type { SubjectTag, Tag } from '@acme-staff/common/entities';

export type ITagCommonReplaceTagRecord = Pick<Tag, 'id' | 'name'>;

export type ITagCommonReplaceSubjectTagRecord = Pick<SubjectTag, 'tagId'>;
