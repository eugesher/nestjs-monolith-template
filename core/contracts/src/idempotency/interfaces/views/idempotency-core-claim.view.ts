import { IdempotencyCoreClaimOutcomeEnum } from '../../enums/idempotency-core-claim-outcome.enum';

export interface IIdempotencyCoreClaimView {
  outcome: IdempotencyCoreClaimOutcomeEnum;
  storedResponse: unknown;
}
