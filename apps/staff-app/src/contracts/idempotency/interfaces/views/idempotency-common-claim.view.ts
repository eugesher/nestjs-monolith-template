import { IdempotencyCommonClaimOutcomeEnum } from '../../enums/idempotency-common-claim-outcome.enum';

export interface IIdempotencyCommonClaimView {
  outcome: IdempotencyCommonClaimOutcomeEnum;
  storedResponse: unknown;
}
