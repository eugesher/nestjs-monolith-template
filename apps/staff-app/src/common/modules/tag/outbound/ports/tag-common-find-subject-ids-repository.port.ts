import type { ITagCommonFindSubjectIdsQuery, ITagCommonFindSubjectIdsRecord } from '../interfaces';

export interface ITagCommonFindSubjectIdsRepositoryPort {
  list(query: ITagCommonFindSubjectIdsQuery): Promise<ITagCommonFindSubjectIdsRecord[]>;
}

export const TAG_COMMON_FIND_SUBJECT_IDS_REPOSITORY_PORT = Symbol(
  'TAG_COMMON_FIND_SUBJECT_IDS_REPOSITORY_PORT',
);
