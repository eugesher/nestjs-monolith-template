import type { Nullable } from '@acme-libs/toolkit';

import type { INoteAccessFindOwnedQuery, INoteAccessRecord } from '../interfaces';

export interface INoteAccessRepositoryPort {
  findOwned(query: INoteAccessFindOwnedQuery): Promise<Nullable<INoteAccessRecord>>;
}

export const NOTE_ACCESS_REPOSITORY_PORT = Symbol('NOTE_ACCESS_REPOSITORY_PORT');
