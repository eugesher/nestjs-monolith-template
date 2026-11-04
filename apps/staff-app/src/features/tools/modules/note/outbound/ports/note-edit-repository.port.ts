import { INoteRevisionInsertQuery, INoteWriteUpdateQuery } from '../interfaces';

export interface INoteEditRepositoryPort {
  update(query: INoteWriteUpdateQuery): Promise<boolean>;
  appendRevision(query: INoteRevisionInsertQuery): Promise<void>;
}

export const NOTE_EDIT_REPOSITORY_PORT = Symbol('NOTE_EDIT_REPOSITORY_PORT');
