import { INoteRevisionListedRecord, INoteRevisionPageQuery } from '../interfaces';

export interface INoteGetRevisionsRepositoryPort {
  listForNote(query: INoteRevisionPageQuery): Promise<[INoteRevisionListedRecord[], number]>;
}

export const NOTE_GET_REVISIONS_REPOSITORY_PORT = Symbol('NOTE_GET_REVISIONS_REPOSITORY_PORT');
