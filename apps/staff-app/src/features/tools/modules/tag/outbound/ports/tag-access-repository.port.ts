import type { Nullable } from '@acme-libs/toolkit';

import type { ITagAccessRecord } from '../interfaces';

export interface ITagAccessRepositoryPort {
  findById(tagId: string): Promise<Nullable<ITagAccessRecord>>;
}

export const TAG_ACCESS_REPOSITORY_PORT = Symbol('TAG_ACCESS_REPOSITORY_PORT');
