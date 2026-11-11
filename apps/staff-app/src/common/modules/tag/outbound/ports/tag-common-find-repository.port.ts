import type { ITagCommonFindQuery, ITagCommonFindRecord } from '../interfaces';

export interface ITagCommonFindRepositoryPort {
  list(query: ITagCommonFindQuery): Promise<ITagCommonFindRecord[]>;
}

export const TAG_COMMON_FIND_REPOSITORY_PORT = Symbol('TAG_COMMON_FIND_REPOSITORY_PORT');
