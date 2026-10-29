import { INoteWriteUpdateCommand } from '../interfaces';

export interface INoteResolveRepositoryPort {
  update(command: INoteWriteUpdateCommand): Promise<boolean>;
}

export const NOTE_RESOLVE_REPOSITORY_PORT = Symbol('NOTE_RESOLVE_REPOSITORY_PORT');
