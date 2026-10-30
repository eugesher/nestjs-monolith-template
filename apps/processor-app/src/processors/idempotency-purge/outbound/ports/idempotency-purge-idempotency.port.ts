export interface IIdempotencyPurgeIdempotencyPort {
  purgeExpired(ttlHours: number): Promise<void>;
}

export const IDEMPOTENCY_PURGE_IDEMPOTENCY_PORT = Symbol('IDEMPOTENCY_PURGE_IDEMPOTENCY_PORT');
