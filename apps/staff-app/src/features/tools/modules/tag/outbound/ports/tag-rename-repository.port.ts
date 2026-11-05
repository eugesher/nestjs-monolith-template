import { ITagRenameQuery } from '../interfaces';

export interface ITagRenameRepositoryPort {
  update(query: ITagRenameQuery): Promise<void>;
}

export const TAG_RENAME_REPOSITORY_PORT = Symbol('TAG_RENAME_REPOSITORY_PORT');
