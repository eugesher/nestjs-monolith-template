import { IIdempotencyCommonKeyCompletionCommand } from '../interfaces';

export interface IIdempotencyCommonCompleteRepositoryPort {
  complete(command: IIdempotencyCommonKeyCompletionCommand): Promise<void>;
}

export const IDEMPOTENCY_COMMON_COMPLETE_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_COMMON_COMPLETE_REPOSITORY_PORT',
);
