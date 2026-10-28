import {
  IItemIdempotencyClaimCommand,
  IItemIdempotencyCompleteCommand,
  IItemIdempotencyOutcomeView,
  IItemIdempotencyReleaseCommand,
  IItemIdempotencyReplayView,
} from '../interfaces';

export interface IItemIdempotencyPort {
  claim<T>(
    command: IItemIdempotencyClaimCommand,
  ): Promise<IItemIdempotencyOutcomeView | IItemIdempotencyReplayView<T>>;
  complete(command: IItemIdempotencyCompleteCommand): Promise<void>;
  release(command: IItemIdempotencyReleaseCommand): Promise<void>;
}

export const ITEM_IDEMPOTENCY_PORT = Symbol('ITEM_IDEMPOTENCY_PORT');
