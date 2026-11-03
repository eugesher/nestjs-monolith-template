import { INoteListedRecord, INotePageQuery } from '../interfaces';

export interface INoteGetManyRepositoryPort {
  list(query: INotePageQuery): Promise<[INoteListedRecord[], number]>;
}

export const NOTE_GET_MANY_REPOSITORY_PORT = Symbol('NOTE_GET_MANY_REPOSITORY_PORT');
