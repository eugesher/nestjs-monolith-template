import { IPage } from '@acme-libs/toolkit';
import { NoteModel } from '../../domain';
import { INotePageQuery } from '../interfaces';

export interface INoteCrudRepositoryPort {
  list(query: INotePageQuery): Promise<IPage<NoteModel>>;
}

export const NOTE_CRUD_REPOSITORY_PORT = Symbol('NOTE_CRUD_REPOSITORY_PORT');
