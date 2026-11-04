import { INoteFoundRecord, INoteInsertQuery } from '../interfaces';

export interface INoteCreateRepositoryPort {
  insert(query: INoteInsertQuery): Promise<string>;
  findInserted(noteId: string): Promise<INoteFoundRecord>;
}

export const NOTE_CREATE_REPOSITORY_PORT = Symbol('NOTE_CREATE_REPOSITORY_PORT');
