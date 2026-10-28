export interface IIdempotencyPurgeIdempotencyPort {
  purgeExpired(): Promise<void>;
}

export const IDEMPOTENCY_PURGE_IDEMPOTENCY_PORT = Symbol('IDEMPOTENCY_PURGE_IDEMPOTENCY_PORT');
