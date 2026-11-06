import {
  IIdempotencyCoreClaimCommand,
  IIdempotencyCoreClaimView,
  IIdempotencyCoreCompleteCommand,
  IIdempotencyCoreReleaseCommand,
} from '../interfaces';

export interface IIdempotencyCorePort {
  handleClaim(command: IIdempotencyCoreClaimCommand): Promise<IIdempotencyCoreClaimView>;
  handleComplete(command: IIdempotencyCoreCompleteCommand): Promise<void>;
  handleRelease(command: IIdempotencyCoreReleaseCommand): Promise<void>;
}

export const IDEMPOTENCY_CORE_PORT = Symbol('IDEMPOTENCY_CORE_PORT');
