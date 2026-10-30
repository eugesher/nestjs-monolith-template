import { IIdempotencyCoreKeyCompletionCommand } from '../interfaces';

export interface IIdempotencyCoreCompleteRepositoryPort {
  complete(command: IIdempotencyCoreKeyCompletionCommand): Promise<void>;
}

export const IDEMPOTENCY_CORE_COMPLETE_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_CORE_COMPLETE_REPOSITORY_PORT',
);
