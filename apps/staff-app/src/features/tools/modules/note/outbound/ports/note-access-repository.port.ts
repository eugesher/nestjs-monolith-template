import { Nullable } from '@acme-libs/toolkit';
import { NoteModel } from '../../domain';
import { INoteAccessFindOwnedQuery } from '../interfaces';

export interface INoteAccessRepositoryPort {
  findOwned(query: INoteAccessFindOwnedQuery): Promise<Nullable<NoteModel>>;
}

export const NOTE_ACCESS_REPOSITORY_PORT = Symbol('NOTE_ACCESS_REPOSITORY_PORT');
