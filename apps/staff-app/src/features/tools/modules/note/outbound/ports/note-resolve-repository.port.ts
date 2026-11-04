import { INoteWriteUpdateQuery } from '../interfaces';

export interface INoteResolveRepositoryPort {
  update(query: INoteWriteUpdateQuery): Promise<boolean>;
}

export const NOTE_RESOLVE_REPOSITORY_PORT = Symbol('NOTE_RESOLVE_REPOSITORY_PORT');
