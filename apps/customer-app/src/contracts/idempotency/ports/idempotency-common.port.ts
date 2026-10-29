import {
  IIdempotencyCommonClaimCommand,
  IIdempotencyCommonClaimView,
  IIdempotencyCommonCompleteCommand,
  IIdempotencyCommonPurgeExpiredView,
  IIdempotencyCommonReleaseCommand,
} from '../interfaces';

export interface IIdempotencyCommonPort {
  claim(command: IIdempotencyCommonClaimCommand): Promise<IIdempotencyCommonClaimView>;
  complete(command: IIdempotencyCommonCompleteCommand): Promise<void>;
  release(command: IIdempotencyCommonReleaseCommand): Promise<void>;
  purgeExpired(): Promise<IIdempotencyCommonPurgeExpiredView>;
}

export const IDEMPOTENCY_COMMON_PORT = Symbol('IDEMPOTENCY_COMMON_PORT');
