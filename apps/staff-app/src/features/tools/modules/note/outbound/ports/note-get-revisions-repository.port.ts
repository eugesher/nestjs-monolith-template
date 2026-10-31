import { IPage } from '@acme-libs/toolkit';
import { NoteRevisionModel } from '../../domain';
import { INoteRevisionPageQuery } from '../interfaces';

export interface INoteGetRevisionsRepositoryPort {
  listForNote(query: INoteRevisionPageQuery): Promise<IPage<NoteRevisionModel>>;
}

export const NOTE_GET_REVISIONS_REPOSITORY_PORT = Symbol('NOTE_GET_REVISIONS_REPOSITORY_PORT');
