import type { ITagCreateInsertRecord, ITagCreateQuery, ITagCreateRecord } from '../interfaces';

export interface ITagCreateRepositoryPort {
  insert(query: ITagCreateQuery): Promise<ITagCreateInsertRecord>;
  findInserted(tagId: string): Promise<ITagCreateRecord>;
}

export const TAG_CREATE_REPOSITORY_PORT = Symbol('TAG_CREATE_REPOSITORY_PORT');
