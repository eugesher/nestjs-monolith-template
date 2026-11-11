import type { INoteGetManyListQuery, INoteGetManyRecord } from '../interfaces';

export interface INoteGetManyRepositoryPort {
  list(query: INoteGetManyListQuery): Promise<INoteGetManyRecord>;
}

export const NOTE_GET_MANY_REPOSITORY_PORT = Symbol('NOTE_GET_MANY_REPOSITORY_PORT');
