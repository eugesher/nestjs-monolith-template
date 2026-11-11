import type { INoteResolveUpdateQuery } from '../interfaces';

export interface INoteResolveRepositoryPort {
  update(query: INoteResolveUpdateQuery): Promise<boolean>;
}

export const NOTE_RESOLVE_REPOSITORY_PORT = Symbol('NOTE_RESOLVE_REPOSITORY_PORT');
