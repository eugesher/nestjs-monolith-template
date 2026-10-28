import { NoteRevisionModel } from '../../domain';
import { INoteWriteUpdateCommand } from '../interfaces';

export interface INoteEditRepositoryPort {
  update(command: INoteWriteUpdateCommand): Promise<boolean>;
  appendRevision(revision: NoteRevisionModel): Promise<void>;
}

export const NOTE_EDIT_REPOSITORY_PORT = Symbol('NOTE_EDIT_REPOSITORY_PORT');
