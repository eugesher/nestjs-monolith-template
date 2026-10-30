import {
  IIdempotencyCorePurgeExpiredCommand,
  IIdempotencyCorePurgeExpiredView,
} from '../interfaces';

export interface IIdempotencyCorePurgePort {
  purgeExpired(
    command: IIdempotencyCorePurgeExpiredCommand,
  ): Promise<IIdempotencyCorePurgeExpiredView>;
}

export const IDEMPOTENCY_CORE_PURGE_PORT = Symbol('IDEMPOTENCY_CORE_PURGE_PORT');
