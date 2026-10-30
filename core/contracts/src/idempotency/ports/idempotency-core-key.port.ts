import {
  IIdempotencyCoreClaimCommand,
  IIdempotencyCoreClaimView,
  IIdempotencyCoreCompleteCommand,
  IIdempotencyCoreReleaseCommand,
} from '../interfaces';

export interface IIdempotencyCoreKeyPort {
  claim(command: IIdempotencyCoreClaimCommand): Promise<IIdempotencyCoreClaimView>;
  complete(command: IIdempotencyCoreCompleteCommand): Promise<void>;
  release(command: IIdempotencyCoreReleaseCommand): Promise<void>;
}

export const IDEMPOTENCY_CORE_KEY_PORT = Symbol('IDEMPOTENCY_CORE_KEY_PORT');
