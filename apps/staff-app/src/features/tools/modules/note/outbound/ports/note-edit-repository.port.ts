import type { INoteEditRevisionInsertQuery, INoteEditUpdateQuery } from '../interfaces';

export interface INoteEditRepositoryPort {
  update(query: INoteEditUpdateQuery): Promise<boolean>;
  appendRevision(query: INoteEditRevisionInsertQuery): Promise<void>;
}

export const NOTE_EDIT_REPOSITORY_PORT = Symbol('NOTE_EDIT_REPOSITORY_PORT');
