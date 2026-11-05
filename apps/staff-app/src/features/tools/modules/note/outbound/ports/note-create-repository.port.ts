import { INoteCreateRecord, INoteCreateInsertQuery } from '../interfaces';

export interface INoteCreateRepositoryPort {
  insert(query: INoteCreateInsertQuery): Promise<string>;
  findInserted(noteId: string): Promise<INoteCreateRecord>;
}

export const NOTE_CREATE_REPOSITORY_PORT = Symbol('NOTE_CREATE_REPOSITORY_PORT');
