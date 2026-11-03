import { INoteRevisionInsertCommand, INoteWriteUpdateCommand } from '../interfaces';

export interface INoteEditRepositoryPort {
  update(command: INoteWriteUpdateCommand): Promise<boolean>;
  appendRevision(command: INoteRevisionInsertCommand): Promise<void>;
}

export const NOTE_EDIT_REPOSITORY_PORT = Symbol('NOTE_EDIT_REPOSITORY_PORT');
