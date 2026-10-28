import { NoteModel } from '../../domain';

export interface INoteCreateRepositoryPort {
  insert(note: NoteModel): Promise<NoteModel>;
}

export const NOTE_CREATE_REPOSITORY_PORT = Symbol('NOTE_CREATE_REPOSITORY_PORT');
