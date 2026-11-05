import { Nullable } from '@acme-libs/toolkit';

import { ITagAccessRecord } from '../interfaces';

export interface ITagAccessRepositoryPort {
  findById(tagId: string): Promise<Nullable<ITagAccessRecord>>;
}

export const TAG_ACCESS_REPOSITORY_PORT = Symbol('TAG_ACCESS_REPOSITORY_PORT');
