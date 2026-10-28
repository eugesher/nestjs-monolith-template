import { Nullable } from '@acme-libs/toolkit';
import { NoteModel } from '../../domain';

export interface INoteAccessRepositoryPort {
  findById(noteId: string): Promise<Nullable<NoteModel>>;
}

export const NOTE_ACCESS_REPOSITORY_PORT = Symbol('NOTE_ACCESS_REPOSITORY_PORT');
