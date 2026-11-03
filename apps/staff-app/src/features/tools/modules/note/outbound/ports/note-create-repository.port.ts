import { INoteFoundRecord, INoteInsertCommand } from '../interfaces';

export interface INoteCreateRepositoryPort {
  insert(command: INoteInsertCommand): Promise<string>;
  findInserted(noteId: string): Promise<INoteFoundRecord>;
}

export const NOTE_CREATE_REPOSITORY_PORT = Symbol('NOTE_CREATE_REPOSITORY_PORT');
