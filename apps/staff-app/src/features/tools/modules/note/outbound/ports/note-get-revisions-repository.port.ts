import type { INoteGetRevisionsListForNoteQuery, INoteGetRevisionsRecord } from '../interfaces';

export interface INoteGetRevisionsRepositoryPort {
  listForNote(query: INoteGetRevisionsListForNoteQuery): Promise<INoteGetRevisionsRecord>;
}

export const NOTE_GET_REVISIONS_REPOSITORY_PORT = Symbol('NOTE_GET_REVISIONS_REPOSITORY_PORT');
