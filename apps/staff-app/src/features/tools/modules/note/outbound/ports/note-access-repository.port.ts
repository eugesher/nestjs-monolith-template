import { Nullable } from '@acme-libs/toolkit';

import { INoteAccessFindOwnedQuery, INoteFoundRecord } from '../interfaces';

export interface INoteAccessRepositoryPort {
  findOwned(query: INoteAccessFindOwnedQuery): Promise<Nullable<INoteFoundRecord>>;
}

export const NOTE_ACCESS_REPOSITORY_PORT = Symbol('NOTE_ACCESS_REPOSITORY_PORT');
