import {
  IOrderIdempotencyClaimCommand,
  IOrderIdempotencyCompleteCommand,
  IOrderIdempotencyOutcomeView,
  IOrderIdempotencyReleaseCommand,
  IOrderIdempotencyReplayView,
} from '../interfaces';

export interface IOrderIdempotencyPort {
  claim<T>(
    command: IOrderIdempotencyClaimCommand,
  ): Promise<IOrderIdempotencyOutcomeView | IOrderIdempotencyReplayView<T>>;
  complete(command: IOrderIdempotencyCompleteCommand): Promise<void>;
  release(command: IOrderIdempotencyReleaseCommand): Promise<void>;
}

export const ORDER_IDEMPOTENCY_PORT = Symbol('ORDER_IDEMPOTENCY_PORT');
